let allItems=[];
const ITEM_ASSET_BASE='https://mc-api.bisai.dev/v1/assets/items/';
function itemImageUrl(id){return ITEM_ASSET_BASE+encodeURIComponent(id)+'/texture.png'}
function visualFallback(icon='▧'){return `<span class="item-icon">${icon}</span>`}
function itemVisual(i,large=false){const fb=escapeHtml(i.icon||'▧');return `<div class="${large?'item-modal-visual':'item-visual'}"><img src="${itemImageUrl(i.id)}" alt="${escapeHtml(i.name)} Minecraft icon" loading="lazy" decoding="async" onerror="this.style.display='none';this.nextElementSibling.style.display='inline'"><span class="item-icon" style="display:none">${fb}</span></div>`}

let filteredItems=[];
let currentPage=1;
const pageSize=48;
const $id=id=>document.getElementById(id);
async function initItems(){
  const response=await fetch('data/items.json');
  if(!response.ok) throw new Error('Could not load item database');
  allItems=await response.json();
  const categories=[...new Set(allItems.map(i=>i.category||i.type))].sort();
  $id('itemCategory').innerHTML='<option value="all">All categories</option>'+categories.map(c=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  $id('itemSearch').addEventListener('input',applyFilters);
  $id('itemCategory').addEventListener('change',applyFilters);
  $id('itemType').addEventListener('change',applyFilters);
  applyFilters();
}
function applyFilters(){
  const q=$id('itemSearch').value.trim().toLowerCase();
  const category=$id('itemCategory').value;
  const type=$id('itemType').value;
  filteredItems=allItems.filter(i=>{
    const text=[i.name,i.id,i.type,i.category,i.description,i.search].join(' ').toLowerCase();
    return (!q||text.includes(q))&&(category==='all'||i.category===category)&&(type==='all'||(type==='blocks'?/block|ore|redstone|glass|wood|decoration|utility|storage/i.test(i.type):!/block|ore|redstone|glass|wood|decoration|utility|storage/i.test(i.type)));
  });
  currentPage=1;renderItems();
}
function renderItems(){
  const totalPages=Math.max(1,Math.ceil(filteredItems.length/pageSize));
  if(currentPage>totalPages)currentPage=totalPages;
  const start=(currentPage-1)*pageSize;
  const page=filteredItems.slice(start,start+pageSize);
  $id('itemCount').textContent=`${filteredItems.length.toLocaleString()} results · ${allItems.length.toLocaleString()} catalog entries`;
  $id('itemGrid').innerHTML=page.length?page.map(i=>`<article class="card item-card" tabindex="0" role="button" onclick="openItem('${i.id}')" onkeydown="if(event.key==='Enter')openItem('${i.id}')">${itemVisual(i)}<span class="tag green">${escapeHtml(i.category||i.type)}</span><h3>${escapeHtml(i.name)}</h3><code class="item-id">minecraft:${escapeHtml(i.id)}</code><p>${escapeHtml(i.description)}</p></article>`).join(''):'<div class="notice">No matching blocks or items were found.</div>';
  $id('pagination').innerHTML=`<button class="btn ghost" ${currentPage===1?'disabled':''} onclick="changePage(-1)">Previous</button><span>Page ${currentPage} of ${totalPages}</span><button class="btn ghost" ${currentPage===totalPages?'disabled':''} onclick="changePage(1)">Next</button>`;
}
function changePage(dir){currentPage+=dir;renderItems();window.scrollTo({top:$id('itemTools').offsetTop-90,behavior:'smooth'});}
function humanizeId(id=''){return id.replace(/^minecraft:/,'').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}
function ingredientLabel(id){return humanizeId(id).replace(/ Planks$/,' Planks')}
function inferredRecipe(i){
  if(i.recipe)return {grid:i.recipe,legend:i.legend||{},title:'Crafting recipe',note:'Place the ingredients in a crafting table as shown.'};
  const id=i.id, wood=id.match(/^(oak|spruce|birch|jungle|acacia|dark_oak|mangrove|cherry|bamboo|crimson|warped|pale_oak)_/i)?.[1];
  const W=wood?wood+'_planks':'planks', L=wood?wood+'_log':'log';
  const shaped=(grid,legend,note='Place the ingredients in a crafting table as shown.')=>({grid,legend,title:'Crafting recipe',note});
  if(/_planks$/.test(id))return shaped([[L,'',''],['','',''],['','','']],{[L]:ingredientLabel(L)},'One matching log or stem crafts four planks.');
  if(/_slab$/.test(id))return shaped([['','',''],[W,W,W],['','','']],{[W]:ingredientLabel(W)},'Three matching blocks craft six slabs.');
  if(/_stairs$/.test(id))return shaped([[W,'',''],[W,W,''],[W,W,W]],{[W]:ingredientLabel(W)},'Six matching blocks craft four stairs.');
  if(/_fence$/.test(id))return shaped([[W,'stick',W],[W,'stick',W],['','','']],{[W]:ingredientLabel(W),stick:'Stick'},'Crafts three fences.');
  if(/_fence_gate$/.test(id))return shaped([['stick',W,'stick'],['stick',W,'stick'],['','','']],{[W]:ingredientLabel(W),stick:'Stick'});
  if(/_door$/.test(id))return shaped([[W,W,''],[W,W,''],[W,W,'']],{[W]:ingredientLabel(W)},'Crafts three doors. Iron and copper doors use matching ingots or blocks.');
  if(/_trapdoor$/.test(id))return shaped([[W,W,W],[W,W,W],['','','']],{[W]:ingredientLabel(W)},'Crafts two trapdoors.');
  if(/_button$/.test(id))return shaped([[W,'',''],['','',''],['','','']],{[W]:ingredientLabel(W)});
  if(/_pressure_plate$/.test(id))return shaped([['','',''],[W,W,''],['','','']],{[W]:ingredientLabel(W)});
  if(/_sign$/.test(id)&&!/_hanging_sign$/.test(id))return shaped([[W,W,W],[W,W,W],['','stick','']],{[W]:ingredientLabel(W),stick:'Stick'},'Crafts three signs.');
  if(/_hanging_sign$/.test(id))return shaped([['chain','', 'chain'],[L,L,L],[L,L,L]],{chain:'Chain',[L]:ingredientLabel(L)},'Crafts six hanging signs.');
  if(/_boat$/.test(id)&&!/_chest_boat$/.test(id))return shaped([[W,'',W],[W,W,W],['','','']],{[W]:ingredientLabel(W)});
  if(/_chest_boat$/.test(id))return shaped([['chest',id.replace('_chest_boat','_boat'),''],['','',''],['','','']],{chest:'Chest',[id.replace('_chest_boat','_boat')]:ingredientLabel(id.replace('_chest_boat','_boat'))});
  if(/_pickaxe$/.test(id))return shaped([['material','material','material'],['','stick',''],['','stick','']],{material:humanizeId(id.replace('_pickaxe','')),stick:'Stick'});
  if(/_axe$/.test(id))return shaped([['material','material',''],['material','stick',''],['','stick','']],{material:humanizeId(id.replace('_axe','')),stick:'Stick'});
  if(/_shovel$/.test(id))return shaped([['','material',''],['','stick',''],['','stick','']],{material:humanizeId(id.replace('_shovel','')),stick:'Stick'});
  if(/_hoe$/.test(id))return shaped([['material','material',''],['','stick',''],['','stick','']],{material:humanizeId(id.replace('_hoe','')),stick:'Stick'});
  if(/_sword$/.test(id))return shaped([['','material',''],['','material',''],['','stick','']],{material:humanizeId(id.replace('_sword','')),stick:'Stick'});
  if(/_helmet$/.test(id))return shaped([['material','material','material'],['material','','material'],['','','']],{material:humanizeId(id.replace('_helmet',''))});
  if(/_chestplate$/.test(id))return shaped([['material','','material'],['material','material','material'],['material','material','material']],{material:humanizeId(id.replace('_chestplate',''))});
  if(/_leggings$/.test(id))return shaped([['material','material','material'],['material','','material'],['material','','material']],{material:humanizeId(id.replace('_leggings',''))});
  if(/_boots$/.test(id))return shaped([['','',''],['material','','material'],['material','','material']],{material:humanizeId(id.replace('_boots',''))});
  const exact={
    crafting_table:[[[W,W,''],[W,W,''],['','','']],{[W]:'Any Planks'}],
    chest:[[[W,W,W],[W,'',W],[W,W,W]],{[W]:'Any Planks'}],
    furnace:[[['cobblestone','cobblestone','cobblestone'],['cobblestone','','cobblestone'],['cobblestone','cobblestone','cobblestone']],{cobblestone:'Cobblestone'}],
    stick:[[[W,W,''],[W,W,''],['','','']],{[W]:'Any Planks'}],
    torch:[[['','coal',''],['','stick',''],['','','']],{coal:'Coal or Charcoal',stick:'Stick'}],
    ladder:[[['stick','', 'stick'],['stick','stick','stick'],['stick','', 'stick']],{stick:'Stick'}],
    glass_bottle:[[["glass",'',"glass"],['',"glass",''],['','','']],{glass:'Glass'}],
    bucket:[[['iron_ingot','', 'iron_ingot'],['','iron_ingot',''],['','','']],{iron_ingot:'Iron Ingot'}],
    compass:[[['','iron_ingot',''],['iron_ingot','redstone','iron_ingot'],['','iron_ingot','']],{iron_ingot:'Iron Ingot',redstone:'Redstone Dust'}],
    clock:[[['','gold_ingot',''],['gold_ingot','redstone','gold_ingot'],['','gold_ingot','']],{gold_ingot:'Gold Ingot',redstone:'Redstone Dust'}],
    book:[[['paper','', ''],['paper','leather',''],['paper','','']],{paper:'Paper',leather:'Leather'}],
    bookshelf:[[[W,W,W],['book','book','book'],[W,W,W]],{[W]:'Any Planks',book:'Book'}],
    bow:[[['','stick','string'],['stick','','string'],['','stick','string']],{stick:'Stick',string:'String'}],
    arrow:[[['','flint',''],['','stick',''],['','feather','']],{flint:'Flint',stick:'Stick',feather:'Feather'}]
  };
  if(exact[id])return shaped(exact[id][0],exact[id][1]);
  let method='This entry is normally obtained through exploration, mining, mob drops, trading, loot, smelting, farming, commands, or another in-game mechanic rather than a standard crafting-table recipe.';
  if(/ore/.test(id))method='Mine this ore with the appropriate pickaxe. Silk Touch may preserve the ore block; otherwise it drops its normal resource or raw material.';
  else if(/spawn_egg/.test(id))method='Spawn eggs are available in Creative mode or through commands and are not craftable in normal Survival gameplay.';
  else if(/music_disc/.test(id))method='Obtain this music disc through loot or its special gameplay drop condition. Music discs do not use a crafting-table recipe.';
  else if(/smithing_template/.test(id))method='Find the original template in its associated structure, then duplicate it using seven diamonds, one matching material block, and the template.';
  else if(/potion|splash_potion|lingering_potion/.test(id))method='Brew this item in a brewing stand. The exact ingredient depends on the potion effect and whether it is splash or lingering.';
  else if(/enchanted_book/.test(id))method='Obtain enchanted books from enchanting, librarian trading, fishing, loot chests, or combining books on an anvil.';
  else if(/raw_|ingot|diamond|emerald|coal|lapis|redstone/.test(id))method='Obtain this material by mining, smelting its raw form where applicable, mob drops, trading, loot, or block conversion.';
  return {grid:null,legend:{},title:'How to obtain',note:method};
}
function renderRecipeInfo(i){
  const r=inferredRecipe(i);
  if(!r.grid)return `<div class="recipe-info"><span class="tag green">${escapeHtml(r.title)}</span><p>${escapeHtml(r.note)}</p></div>`;
  const cells=r.grid.flat();while(cells.length<9)cells.push('');
  const legend=Object.entries(r.legend||{}).map(([k,v])=>`<span><strong>${escapeHtml(humanizeId(k))}</strong> = ${escapeHtml(v)}</span>`).join(' · ');
  return `<div class="recipe-layout"><div><span class="tag green">${escapeHtml(r.title)}</span><div class="recipe">${cells.slice(0,9).map(x=>`<div class="slot" title="${escapeHtml(x?ingredientLabel(x):'Empty slot')}">${x?`<small>${escapeHtml(ingredientLabel(x))}</small>`:''}</div>`).join('')}</div></div><div class="recipe-copy"><p>${escapeHtml(r.note||'')}</p>${legend?`<p>${legend}</p>`:''}<small class="muted">Recipe patterns are a template guide. Minecraft updates and item variants can change exact ingredients.</small></div></div>`;
}
let lastItemTrigger=null;
function openItem(id){
  const i=allItems.find(x=>x.id===id);if(!i)return;
  lastItemTrigger=document.activeElement;
  const uses=(i.uses||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join('')||'<li>Use this entry according to its normal Minecraft gameplay behavior.</li>';
  $id('itemModalBody').innerHTML=`<div class="item-modal-heading">${itemVisual(i,true)}<div><span class="tag">${escapeHtml(i.rarity||'Common')}</span><h2 id="itemModalTitle">${escapeHtml(i.name)}</h2><code>minecraft:${escapeHtml(i.id)}</code></div></div><p class="muted">${escapeHtml(i.description)}</p><p><strong>Category:</strong> ${escapeHtml(i.category||i.type)} · <strong>Type:</strong> ${escapeHtml(i.type)}</p><h3>Common uses</h3><ul>${uses}</ul><h3>Recipe / obtaining method</h3>${renderRecipeInfo(i)}`;
  const modal=$id('itemModal');
  modal.classList.remove('is-closing');
  modal.setAttribute('aria-hidden','false');
  document.body.classList.add('recipe-modal-open');
  requestAnimationFrame(()=>modal.classList.add('is-open'));
  setTimeout(()=>$id('closeItem')?.focus(),180);
}
function closeItemModal(){
  const modal=$id('itemModal');if(!modal||!modal.classList.contains('is-open'))return;
  modal.classList.add('is-closing');modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');
  document.body.classList.remove('recipe-modal-open');
  setTimeout(()=>modal.classList.remove('is-closing'),320);
  lastItemTrigger?.focus?.();
}
document.addEventListener('DOMContentLoaded',()=>{
  initItems().catch(err=>$id('itemGrid').innerHTML=`<div class="notice">${escapeHtml(err.message)}. Run the site through Live Server or a local web server instead of file://.</div>`);
  $id('closeItem').onclick=closeItemModal;
  $id('itemModal').addEventListener('click',e=>{if(e.target===$id('itemModal'))closeItemModal()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeItemModal()});
});
const VISUAL_MOBS=[
 ['creeper','Creeper','Hostile','Explodes when close to players.'],['zombie','Zombie','Hostile','Common undead hostile mob.'],['skeleton','Skeleton','Hostile','Ranged undead mob using a bow.'],['spider','Spider','Neutral / Hostile','Climbs walls and becomes hostile in low light.'],['enderman','Enderman','Neutral','Tall teleporting mob that reacts to eye contact.'],['slime','Slime','Hostile','Bouncy mob that splits into smaller slimes.'],['pig','Pig','Passive','Farm animal that can be bred and ridden with the right equipment.'],['cow','Cow','Passive','Farm animal providing beef, leather and milk.'],['sheep','Sheep','Passive','Provides wool and can be dyed many colors.'],['chicken','Chicken','Passive','Provides eggs, feathers and food.'],['wolf','Wolf','Neutral / Tameable','Can be tamed and accompanies players.'],['villager','Villager','Passive','Trading NPC with professions and village jobs.']
];
function renderMobs(){const el=$id('mobGrid');if(!el)return;el.innerHTML=VISUAL_MOBS.map(([id,name,type,desc])=>`<article class="card mob-card"><img src="https://skinrender.dev/render/mob/${id}/body?size=256" alt="${name} Minecraft mob render" loading="lazy" decoding="async"><span class="tag green">${type}</span><h3>${name}</h3><code>minecraft:${id}</code><p>${desc}</p></article>`).join('')}
document.addEventListener('DOMContentLoaded',renderMobs);
