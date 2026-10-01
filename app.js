const KEY="kasir_bakso_kaka_eci_v1";
const defaults={menus:[
  {id:1,name:"Bakso Urat",price:10000},
  {id:2,name:"Bakso Cincang",price:10000},
  {id:3,name:"Bakso Keju",price:10000},
  {id:4,name:"Bakso Jumbo",price:15000},
  {id:5,name:"Baso Tetelan",price:12000}
],tabs:[1,2],activeTab:1,nextTab:2,carts:{1:[],2:[]},history:[]};

let state=load();
let selectedMenu=null;

function load(){try{return Object.assign(structuredClone(defaults),JSON.parse(localStorage.getItem(KEY)||"null"))}catch(e){return structuredClone(defaults)}}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function rupiah(n){return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n)}
function today(){return new Date().toLocaleDateString("id-ID",{day:"2-digit",month:"short",year:"numeric"})}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function cart(){return state.carts[state.activeTab]||[]}
function total(){return cart().reduce((a,x)=>a+x.subtotal,0)}
function soldMap(){const m={}; state.history.forEach(t=>t.items.forEach(x=>m[x.name]=(m[x.name]||0)+x.qty)); return m}
function revenue(){return state.history.reduce((a,t)=>a+t.total,0)}

function render(){
  document.getElementById("today").textContent=today();
  renderMenu(); renderTabs(); renderCart(); renderSummary(); renderEditor(); renderHistory();
  document.getElementById("activeLabel").textContent=state.activeTab;
  document.getElementById("totalText").textContent=rupiah(total());
  document.getElementById("clearCart").classList.toggle("hidden",cart().length===0);
  document.getElementById("payBtn").disabled=cart().length===0;
}
function renderMenu(){
  document.getElementById("menuGrid").innerHTML=state.menus.map(m=>`
    <button class="menu-card" data-menu="${m.id}">
      <span class="menu-name">${esc(m.name)}</span><span class="menu-price">${rupiah(m.price)}</span>
    </button>`).join("");
}
function renderTabs(){
  document.getElementById("tabs").innerHTML=state.tabs.map(id=>{
    const c=(state.carts[id]||[]).reduce((a,x)=>a+x.qty,0);
    return `<button class="tab ${id===state.activeTab?"active":""}" data-tab="${id}">P${id}${c?` <span class="count">${c}</span>`:""}${state.tabs.length>1?` <span class="tab-x" data-del-tab="${id}">×</span>`:""}</button>`;
  }).join("");
}
function renderCart(){
  const c=cart(), el=document.getElementById("cart");
  if(!c.length){el.innerHTML=`<div class="empty">🛒<br>Keranjang Pesanan ${state.activeTab} Kosong</div>`;return}
  el.innerHTML=c.map((x,i)=>`<div class="cart-item">
    <div><div class="cart-name">${esc(x.name)} <span>×${x.qty}</span></div>
    ${x.note?`<div class="cart-note">Catatan: ${esc(x.note)}</div>`:""}
    <div class="cart-price">${rupiah(x.subtotal)}</div></div>
    <button class="remove" data-remove="${i}">✕</button>
  </div>`).join("");
}
function renderSummary(){
  const sm=soldMap(), entries=Object.entries(sm);
  document.getElementById("soldText").textContent=entries.length?entries.map(([k,v])=>`${k} (${v})`).join(", "):"0 porsi";
  document.getElementById("revenueText").textContent=rupiah(revenue());
}
function renderEditor(){
  document.getElementById("menuEditor").innerHTML=state.menus.map(m=>`
    <div class="editor-row">
      <input data-edit-name="${m.id}" value="${esc(m.name)}">
      <input data-edit-price="${m.id}" type="number" inputmode="numeric" value="${m.price}">
      <button class="icon-btn save" data-save-menu="${m.id}">✓</button>
      <button class="icon-btn del" data-del-menu="${m.id}">✕</button>
    </div>`).join("");
}
function renderHistory(){
  const el=document.getElementById("historyList");
  if(!state.history.length){el.innerHTML=`<div class="empty" style="height:180px">Belum ada transaksi.</div>`;return}
  el.innerHTML=[...state.history].reverse().map((t,ri)=>{
    const idx=state.history.length-1-ri;
    const details=t.items.map(x=>`${esc(x.name)} ×${x.qty}${x.note?` [${esc(x.note)}]`:""}`).join(", ");
    return `<div class="history-item">
      <div class="history-top"><span>${esc(t.date)} • ${esc(t.time)}</span><span>Pesanan ${t.tab}</span></div>
      <div class="history-total">${rupiah(t.total)}</div>
      <div class="history-detail">${details}</div>
      <button class="history-delete" data-del-history="${idx}">Hapus transaksi</button>
    </div>`;
  }).join("");
}

function open(id){document.getElementById(id).classList.remove("hidden")}
function close(id){document.getElementById(id).classList.add("hidden")}

document.addEventListener("click",e=>{
  const menu=e.target.closest("[data-menu]");
  if(menu){selectedMenu=state.menus.find(m=>m.id===Number(menu.dataset.menu));if(selectedMenu){document.getElementById("noteTitle").textContent=`${selectedMenu.name} • ${rupiah(selectedMenu.price)}`;document.getElementById("noteInput").value="";open("noteModal");setTimeout(()=>document.getElementById("noteInput").focus(),50)}}
  const tab=e.target.closest("[data-tab]");
  if(tab){const del=e.target.closest("[data-del-tab]");if(del){e.stopPropagation();const id=Number(del.dataset.delTab);if(state.tabs.length>1&&confirm(`Hapus Pesanan ${id}?`)){state.tabs=state.tabs.filter(x=>x!==id);delete state.carts[id];if(state.activeTab===id)state.activeTab=state.tabs[0];save();render()}}else{state.activeTab=Number(tab.dataset.tab);save();render()}}
  const rem=e.target.closest("[data-remove]");
  if(rem){cart().splice(Number(rem.dataset.remove),1);save();render()}
  const saveM=e.target.closest("[data-save-menu]");
  if(saveM){const id=Number(saveM.dataset.saveMenu),m=state.menus.find(x=>x.id===id);m.name=document.querySelector(`[data-edit-name="${id}"]`).value.trim();m.price=Number(document.querySelector(`[data-edit-price="${id}"]`).value);if(!m.name||m.price<=0)return alert("Nama dan harga harus diisi.");save();render()}
  const delM=e.target.closest("[data-del-menu]");
  if(delM){const id=Number(delM.dataset.delMenu);if(confirm("Hapus menu ini?")){state.menus=state.menus.filter(x=>x.id!==id);save();render()}}
  const delH=e.target.closest("[data-del-history]");
  if(delH){const idx=Number(delH.dataset.delHistory);if(confirm("Hapus transaksi ini?")){state.history.splice(idx,1);save();render()}}
  const closeBtn=e.target.closest("[data-close]");
  if(closeBtn)close(closeBtn.dataset.close);
});

document.getElementById("addToCart").onclick=()=>{
  if(!selectedMenu)return;
  const note=document.getElementById("noteInput").value.trim(), c=cart();
  const same=c.find(x=>x.name===selectedMenu.name&&x.note===note);
  if(same){same.qty++;same.subtotal=same.qty*selectedMenu.price}else c.push({name:selectedMenu.name,price:selectedMenu.price,qty:1,subtotal:selectedMenu.price,note});
  save();close("noteModal");render();
};
document.getElementById("addTab").onclick=()=>{
  state.nextTab++;const id=state.nextTab;state.tabs.push(id);state.carts[id]=[];state.activeTab=id;save();render();
};
document.getElementById("clearCart").onclick=()=>{if(confirm("Kosongkan keranjang ini?")){state.carts[state.activeTab]=[];save();render()}};
document.querySelectorAll(".quick-money button").forEach(b=>b.onclick=()=>document.getElementById("moneyInput").value=b.dataset.money||total());
document.getElementById("exactBtn").onclick=()=>document.getElementById("moneyInput").value=total();
document.getElementById("payBtn").onclick=()=>{
  const t=total(), money=Number(document.getElementById("moneyInput").value);
  if(!t)return alert("Keranjang masih kosong.");
  if(!money||money<t)return alert("Uang diterima kurang.");
  const c=cart().map(x=>({...x}));
  state.history.push({date:today(),time:new Date().toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"}),tab:state.activeTab,total:t,items:c});
  state.carts[state.activeTab]=[];document.getElementById("moneyInput").value="";save();render();
  const bar=document.getElementById("successBar");bar.innerHTML=`✓ Transaksi berhasil — Kembalian: <b>${rupiah(money-t)}</b>`;bar.classList.remove("hidden");setTimeout(()=>bar.classList.add("hidden"),4000);
};
document.getElementById("settingsBtn").onclick=()=>open("settingsModal");
document.getElementById("historyBtn").onclick=()=>{close("settingsModal");open("historyModal");renderHistory()};
document.getElementById("saveMenu").onclick=()=>{
  const name=document.getElementById("newName").value.trim(),price=Number(document.getElementById("newPrice").value);
  if(!name||price<=0)return alert("Nama dan harga harus diisi.");
  state.menus.push({id:Date.now(),name,price});document.getElementById("newName").value="";document.getElementById("newPrice").value="";save();render();
};
document.getElementById("resetData").onclick=()=>{
  if(confirm("Yakin hapus omset dan seluruh riwayat transaksi? Menu dan pesanan aktif tetap dipertahankan.")){state.history=[];save();render()}
};

if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
render();