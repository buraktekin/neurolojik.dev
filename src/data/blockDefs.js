/* Block Definition System
   Each block has:
   - label, icon, cat  — for the picker UI
   - def()             — returns default data object
   - render(data, openImgPop) — returns a DOM element
   - ser(el)           — reads DOM element back to data
*/

export const PICKER_CATS = [
  { label:'Text',             types:['text','h1','h2','h3','quote','pullquote','callout','checklist','divider'] },
  { label:'Media',            types:['image','gallery'] },
  { label:'Data & Structure', types:['stats','procon','table','code','highlight'] },
  { label:'Special',          types:['gear','recipe','timeline','location','tags'] },
]

export const BDEFS = {
  text: {
    label:'Text', icon:'¶', cat:'text',
    def: () => ({ html:'' }),
    render(data) {
      const d = ce('div','b-text')
      d.contentEditable='true'; d.dataset.ph='Start writing…'
      d.innerHTML = data.html||''
      return d
    },
    ser(el) { return { html: qs(el,'.b-text')?.innerHTML||'' } },
  },
  h1: {
    label:'Heading 1', icon:'H1', cat:'text',
    def: () => ({ text:'' }),
    render(data) {
      const d=ce('div','b-h1'); d.contentEditable='true'; d.dataset.ph='Title'
      d.textContent=data.text||''; return d
    },
    ser(el) { return { text: qs(el,'.b-h1')?.textContent||'' } },
  },
  h2: {
    label:'Heading 2', icon:'H2', cat:'text',
    def: () => ({ text:'' }),
    render(data) {
      const d=ce('div','b-h2'); d.contentEditable='true'; d.dataset.ph='Section heading'
      d.textContent=data.text||''; return d
    },
    ser(el) { return { text: qs(el,'.b-h2')?.textContent||'' } },
  },
  h3: {
    label:'Heading 3', icon:'H3', cat:'text',
    def: () => ({ text:'' }),
    render(data) {
      const d=ce('div','b-h3'); d.contentEditable='true'; d.dataset.ph='Subheading'
      d.textContent=data.text||''; return d
    },
    ser(el) { return { text: qs(el,'.b-h3')?.textContent||'' } },
  },
  quote: {
    label:'Quote', icon:'"', cat:'text',
    def: () => ({ text:'' }),
    render(data) {
      const d=ce('div','b-quote'); d.contentEditable='true'; d.dataset.ph='Enter a quote…'
      d.innerHTML=data.text||''; return d
    },
    ser(el) { return { text: qs(el,'.b-quote')?.innerHTML||'' } },
  },
  pullquote: {
    label:'Pullquote', icon:'❝', cat:'text',
    def: () => ({ text:'\u201cThe decisive moment.\u201d', attr:'\u2014 Your name' }),
    render(data) {
      const d=ce('div','b-pullquote')
      const qt=ce('div','pq-text'); qt.contentEditable='true'; qt.dataset.ph='Your memorable line…'; qt.innerHTML=data.text||''
      const at=ce('div','pq-attr'); at.contentEditable='true'; at.dataset.ph='\u2014 Attribution'; at.textContent=data.attr||''
      d.appendChild(qt); d.appendChild(at); return d
    },
    ser(el) { return { text:qs(el,'.pq-text')?.innerHTML||'', attr:qs(el,'.pq-attr')?.textContent||'' } },
  },
  callout: {
    label:'Callout', icon:'💡', cat:'text',
    def: () => ({ type:'tip', text:'' }),
    render(data) {
      const icons={info:'ℹ️',tip:'💡',warn:'⚠️',danger:'🔥'}
      const t=data.type||'tip'
      const d=ce('div',`b-callout co-${t}`)
      const ic=ce('span','co-icon'); ic.textContent=icons[t]
      const right=document.createElement('div'); right.style.flex='1'
      const sel=document.createElement('select'); sel.className='co-type-sel'
      Object.entries({info:'ℹ️ Info',tip:'💡 Tip',warn:'⚠️ Warning',danger:'🔥 Danger'}).forEach(([v,l])=>{
        const o=document.createElement('option'); o.value=v; o.textContent=l; if(v===t)o.selected=true; sel.appendChild(o)
      })
      sel.addEventListener('change',()=>{ d.className=`b-callout co-${sel.value}`; ic.textContent=icons[sel.value] })
      const body=ce('div','co-body'); body.contentEditable='true'; body.dataset.ph='Write your callout…'; body.innerHTML=data.text||''
      right.appendChild(sel); right.appendChild(body)
      d.appendChild(ic); d.appendChild(right); return d
    },
    ser(el) {
      const s=qs(el,'.co-type-sel')
      return { type:s?.value||'tip', text:qs(el,'.co-body')?.innerHTML||'' }
    },
  },
  checklist: {
    label:'Checklist', icon:'✓', cat:'text',
    def: () => ({ items:[{checked:false,text:''},{checked:false,text:''}] }),
    render(data) {
      const d=ce('div','b-checklist')
      const items=(data.items&&data.items.length)?data.items:[{checked:false,text:''}]
      const addBtn=ce('button','cl-add'); addBtn.textContent='+ Add item'
      addBtn.addEventListener('click',()=>addItem({checked:false,text:''}))
      d.appendChild(addBtn)
      function addItem(item) {
        const row=ce('div','cl-item'+(item.checked?' done':''))
        const cb=document.createElement('input'); cb.type='checkbox'; cb.checked=item.checked
        cb.addEventListener('change',()=>row.classList.toggle('done',cb.checked))
        const txt=ce('div','cl-text'); txt.contentEditable='true'; txt.dataset.ph='To-do item…'; txt.innerHTML=item.text||''
        row.appendChild(cb); row.appendChild(txt)
        d.insertBefore(row,addBtn)
      }
      items.forEach(it=>addItem(it)); return d
    },
    ser(el) {
      const items=[]
      qs(el,'.b-checklist')?.querySelectorAll('.cl-item').forEach(row=>{
        items.push({checked:row.querySelector('input')?.checked||false, text:row.querySelector('.cl-text')?.innerHTML||''})
      })
      return {items}
    },
  },
  divider: {
    label:'Divider', icon:'──', cat:'text',
    def: () => ({}),
    render() { const d=ce('div','b-divider'); d.innerHTML='<span>✦</span>'; return d },
    ser() { return {} },
  },
  image: {
    label:'Image', icon:'🖼', cat:'media',
    def: () => ({ src:'', caption:'' }),
    render(data, openImgPop) {
      const wrap=document.createElement('div')
      const zone=ce('div','img-zone')
      zone.dataset.src=data.src||''
      if(data.src) {
        zone.innerHTML=`<img src="${data.src}" alt=""><div class="img-change">Change</div>`
      } else {
        zone.innerHTML=`<div class="img-placeholder"><div class="iph-icon">🖼</div><p>Click to add image</p></div>`
      }
      zone.addEventListener('click',()=>openImgPop&&openImgPop(src=>{
        zone.innerHTML=`<img src="${src}" alt=""><div class="img-change">Change</div>`
        zone.dataset.src=src
      }))
      const cap=ce('div','img-caption'); cap.contentEditable='true'; cap.dataset.ph='Add a caption…'; cap.innerHTML=data.caption||''
      wrap.appendChild(zone); wrap.appendChild(cap); return wrap
    },
    ser(el) {
      return { src:el.querySelector('.img-zone')?.dataset.src||'', caption:el.querySelector('.img-caption')?.innerHTML||'' }
    },
  },
  gallery: {
    label:'Gallery', icon:'▦', cat:'media',
    def: () => ({ images:[{src:''},{src:''},{src:''}] }),
    render(data, openImgPop) {
      const d=ce('div','b-gallery')
      const imgs=data.images||[{src:''},{src:''},{src:''}]
      // Count how many images have src
      const filledCount = imgs.filter(img => img.src).length
      // Set grid layout based on number of filled images
      if (filledCount === 1) {
        d.style.gridTemplateColumns = '1fr'
      } else if (filledCount === 2) {
        d.style.gridTemplateColumns = '1fr 1fr'
      } else {
        d.style.gridTemplateColumns = 'repeat(3, 1fr)'
      }
      
      imgs.forEach(img=>{
        const slot=ce('div','gal-slot'); slot.dataset.src=img.src||''
        if(img.src) slot.innerHTML=`<img src="${img.src}" alt=""><button class="gal-change">Change</button>`
        else slot.innerHTML=`<div class="gal-ph">📷</div>`
        slot.addEventListener('click',()=>openImgPop&&openImgPop(src=>{
          slot.innerHTML=`<img src="${src}" alt=""><button class="gal-change">Change</button>`
          slot.dataset.src=src
          // Recount and update layout
          const filled = [...d.querySelectorAll('.gal-slot')].filter(s => s.dataset.src).length
          if (filled === 1) d.style.gridTemplateColumns = '1fr'
          else if (filled === 2) d.style.gridTemplateColumns = '1fr 1fr'
          else d.style.gridTemplateColumns = 'repeat(3, 1fr)'
        }))
        d.appendChild(slot)
      }); return d
    },
    ser(el) {
      const images=[]
      el.querySelector('.b-gallery')?.querySelectorAll('.gal-slot').forEach(s=>images.push({src:s.dataset.src||''}))
      return {images}
    },
  },
  stats: {
    label:'Stats', icon:'#', cat:'data',
    def: () => ({ items:[{value:'—',label:'Stat 1'},{value:'—',label:'Stat 2'},{value:'—',label:'Stat 3'},{value:'—',label:'Stat 4'}] }),
    render(data) {
      const d=ce('div','b-stats')
      const items=data.items||[{value:'—',label:'Label'}]
      items.forEach(item=>{
        const card=ce('div','stat-card')
        const val=ce('div','stat-val'); val.contentEditable='true'; val.dataset.ph='42'; val.textContent=item.value||''
        const lbl=ce('div','stat-lbl'); lbl.contentEditable='true'; lbl.dataset.ph='Label'; lbl.textContent=item.label||''
        card.appendChild(val); card.appendChild(lbl); d.appendChild(card)
      }); return d
    },
    ser(el) {
      const items=[]
      el.querySelector('.b-stats')?.querySelectorAll('.stat-card').forEach(c=>{
        items.push({value:c.querySelector('.stat-val')?.textContent||'', label:c.querySelector('.stat-lbl')?.textContent||''})
      }); return {items}
    },
  },
  procon: {
    label:'Pros & Cons', icon:'±', cat:'data',
    def: () => ({ pros:[''], cons:[''] }),
    render(data) {
      const d=ce('div','b-procon')
      function makeCol(type,items) {
        const col=ce('div',`procon-col ${type}`)
        const hdr=ce('div','procon-header'); hdr.textContent=type==='pros'?'✓ Highlights':'✗ Reality Checks'
        col.appendChild(hdr)
        const addBtn=ce('button','procon-add'); addBtn.textContent='+ Add'
        addBtn.addEventListener('click',()=>addItem(''))
        col.appendChild(addBtn)
        function addItem(text) {
          const row=ce('div','procon-item')
          const t=ce('div','procon-item-text'); t.contentEditable='true'
          t.dataset.ph=type==='pros'?'Add a highlight…':'Add a reality check…'
          t.innerHTML=text||''
          row.appendChild(t); col.insertBefore(row,addBtn)
        }
        (items||['']).forEach(it=>addItem(it)); return col
      }
      d.appendChild(makeCol('pros',data.pros)); d.appendChild(makeCol('cons',data.cons)); return d
    },
    ser(el) {
      const p=el.querySelector('.b-procon')
      const pros=[],cons=[]
      p?.querySelectorAll('.procon-col.pros .procon-item-text').forEach(t=>pros.push(t.innerHTML))
      p?.querySelectorAll('.procon-col.cons .procon-item-text').forEach(t=>cons.push(t.innerHTML))
      return {pros,cons}
    },
  },
  code: {
    label:'Code', icon:'</>', cat:'data',
    def: () => ({ lang:'javascript', code:'' }),
    render(data) {
      const d=ce('div','b-code')
      const langs=['javascript','typescript','python','bash','css','html','sql','json','yaml','go','rust']
      let lsHtml=`<select class="code-lang">`
      langs.forEach(l=>{ lsHtml+=`<option value="${l}"${l===(data.lang||'javascript')?' selected':''}>${l}</option>` })
      lsHtml+='</select>'
      d.innerHTML=`<div class="code-header">${lsHtml}<div class="code-dots" style="margin-left:auto;display:flex;gap:5px"><div class="code-dot"></div><div class="code-dot"></div><div class="code-dot"></div></div></div><pre class="code-body" contenteditable="true" spellcheck="false" data-ph="// Paste your code here…">${esc(data.code||'')}</pre>`
      return d
    },
    ser(el) {
      const c=el.querySelector('.b-code')
      return { lang:c?.querySelector('.code-lang')?.value||'javascript', code:c?.querySelector('.code-body')?.textContent||'' }
    },
  },
  highlight: {
    label:'Highlight', icon:'★', cat:'data',
    def: () => ({ label:'Key Takeaway', text:'' }),
    render(data) {
      const d=ce('div','b-highlight')
      const lbl=ce('div','hl-label'); lbl.contentEditable='true'; lbl.textContent=data.label||'Key Takeaway'
      const txt=ce('div','hl-text'); txt.contentEditable='true'; txt.dataset.ph='The one thing to remember…'; txt.innerHTML=data.text||''
      d.appendChild(lbl); d.appendChild(txt); return d
    },
    ser(el) { return { label:el.querySelector('.hl-label')?.textContent||'', text:el.querySelector('.hl-text')?.innerHTML||'' } },
  },
  table: {
    label:'Table', icon:'⊞', cat:'data',
    def: () => ({ headers:['Column 1','Column 2','Column 3'], rows:[['','',''],['','',' ']] }),
    render(data) {
      const hdrs=data.headers||['Col 1','Col 2','Col 3']
      const rows=data.rows||[['','']]
      const wrap=document.createElement('div')
      const tbl=ce('table','b-table')
      const thead=document.createElement('thead'); const hr=document.createElement('tr')
      hdrs.forEach(h=>{ const th=document.createElement('th'); th.contentEditable='true'; th.textContent=h; hr.appendChild(th) })
      thead.appendChild(hr); tbl.appendChild(thead)
      const tbody=document.createElement('tbody')
      rows.forEach(row=>{ const tr=document.createElement('tr'); hdrs.forEach((_,ci)=>{ const td=document.createElement('td'); td.contentEditable='true'; td.textContent=(row&&row[ci])||''; tr.appendChild(td) }); tbody.appendChild(tr) })
      tbl.appendChild(tbody); wrap.appendChild(tbl)
      const addRowBtn=ce('button','table-add-row'); addRowBtn.textContent='+ Add row'
      addRowBtn.addEventListener('click',()=>{ const tr=document.createElement('tr'); hdrs.forEach(()=>{ const td=document.createElement('td'); td.contentEditable='true'; tr.appendChild(td) }); tbody.appendChild(tr) })
      wrap.appendChild(addRowBtn); return wrap
    },
    ser(el) {
      const tbl=el.querySelector('.b-table'); if(!tbl) return {}
      const headers=[...tbl.querySelectorAll('th')].map(th=>th.textContent)
      const rows=[...tbl.querySelectorAll('tbody tr')].map(tr=>[...tr.querySelectorAll('td')].map(td=>td.textContent))
      return {headers,rows}
    },
  },
  gear: {
    label:'Gear List', icon:'📷', cat:'special',
    def: () => ({ items:[{emoji:'📷',name:'Camera Body',spec:''},{emoji:'🔭',name:'Lens',spec:''}] }),
    render(data) {
      const d=ce('div','b-gear')
      const addBtn=ce('button','gear-add'); addBtn.textContent='+ Add gear item'
      addBtn.addEventListener('click',()=>addItem({emoji:'⚙️',name:'',spec:''}))
      d.appendChild(addBtn)
      function addItem(item) {
        const row=ce('div','gear-item')
        
        // Delete button
        const deleteBtn=ce('button','gear-item-delete')
        deleteBtn.innerHTML='×'
        deleteBtn.title='Delete item'
        deleteBtn.addEventListener('click',(e)=>{
          e.stopPropagation()
          if(confirm('Delete this gear item?')){
            row.remove()
          }
        })
        
        const em=ce('div','gear-emoji'); em.contentEditable='true'; em.textContent=item.emoji||'📷'
        const info=ce('div','gear-info')
        const nm=ce('div','gear-name'); nm.contentEditable='true'; nm.dataset.ph='Item name'; nm.textContent=item.name||''
        const sp=ce('div','gear-spec'); sp.contentEditable='true'; sp.dataset.ph='Specs / notes'; sp.textContent=item.spec||''
        info.appendChild(nm); info.appendChild(sp)
        row.appendChild(deleteBtn)
        row.appendChild(em)
        row.appendChild(info)
        d.insertBefore(row,addBtn)
      }
      (data.items||[]).forEach(it=>addItem(it)); return d
    },
    ser(el) {
      const items=[]
      el.querySelector('.b-gear')?.querySelectorAll('.gear-item').forEach(row=>{
        items.push({emoji:row.querySelector('.gear-emoji')?.textContent||'', name:row.querySelector('.gear-name')?.textContent||'', spec:row.querySelector('.gear-spec')?.textContent||''})
      }); return {items}
    },
  },
  recipe: {
    label:'Dish / Recipe', icon:'🍜', cat:'special',
    def: () => ({ items:[{src:'',name:'Dish Name',desc:'',price:'',tags:['spicy','vegetarian']}] }),
    render(data, openImgPop) {
      const d=ce('div','b-recipe')
      const addBtn=ce('button','recipe-add'); addBtn.textContent='+ Add dish'
      addBtn.addEventListener('click',()=>addItem({src:'',name:'',desc:'',price:'',tags:[]}))
      d.appendChild(addBtn)
      function addItem(item) {
        const row=ce('div','recipe-item')
        
        // Delete button for this dish
        const deleteBtn=ce('button','recipe-item-delete')
        deleteBtn.innerHTML='×'
        deleteBtn.title='Delete dish'
        deleteBtn.addEventListener('click',(e)=>{
          e.stopPropagation()
          if(confirm('Delete this dish?')){
            row.remove()
          }
        })
        
        const imgSlot=ce('div','recipe-img-slot'); imgSlot.dataset.src=item.src||''
        imgSlot.textContent=item.src?'':'🍽'
        if(item.src){const img=document.createElement('img');img.src=item.src;imgSlot.textContent='';imgSlot.appendChild(img)}
        imgSlot.addEventListener('click',()=>openImgPop&&openImgPop(src=>{imgSlot.textContent='';const img=document.createElement('img');img.src=src;imgSlot.appendChild(img);imgSlot.dataset.src=src}))
        const det=ce('div','recipe-details')
        const nm=ce('div','recipe-name'); nm.contentEditable='true'; nm.dataset.ph='Dish name'; nm.textContent=item.name||''
        const desc=ce('div','recipe-desc'); desc.contentEditable='true'; desc.dataset.ph='Short description…'; desc.textContent=item.desc||''
        
        // Inline-editable tags
        const tagsDiv=ce('div','recipe-tags')
        const tags = item.tags || []
        function renderTags() {
          tagsDiv.innerHTML = ''
          
          // Render existing tags as inline-editable
          tags.forEach((tag, idx) => {
            const chip = ce('span', 'recipe-tag')
            const label = ce('span', 'tag-label')
            label.contentEditable = 'true'
            label.textContent = tag
            label.dataset.placeholder = 'tag'
            
            // Update tag on blur or enter
            label.addEventListener('blur', () => {
              const val = label.textContent.trim()
              if (val) tags[idx] = val
              else { tags.splice(idx, 1); renderTags() }
            })
            label.addEventListener('keydown', e => {
              if (e.key === 'Enter') { e.preventDefault(); label.blur() }
            })
            
            const removeBtn = ce('button', 'tag-remove')
            removeBtn.textContent = '×'
            removeBtn.addEventListener('click', (e) => {
              e.stopPropagation()
              tags.splice(idx, 1)
              renderTags()
            })
            
            chip.appendChild(label)
            chip.appendChild(removeBtn)
            tagsDiv.appendChild(chip)
          })
          
          // Plus button to add new tag
          const plusBtn = ce('button', 'tag-plus-btn')
          plusBtn.innerHTML = '+'
          plusBtn.title = 'Add tag'
          plusBtn.addEventListener('click', () => {
            tags.push('')
            renderTags()
            // Focus the new tag
            setTimeout(() => {
              const newTag = tagsDiv.querySelectorAll('.tag-label')[tags.length - 1]
              if (newTag) { newTag.focus() }
            }, 0)
          })
          tagsDiv.appendChild(plusBtn)
        }
        renderTags()
        
        const pr=ce('div','recipe-price'); pr.contentEditable='true'; pr.dataset.ph='Price / notes'; pr.textContent=item.price||''
        det.appendChild(nm); det.appendChild(desc); det.appendChild(tagsDiv); det.appendChild(pr)
        row.appendChild(deleteBtn)
        row.appendChild(imgSlot)
        row.appendChild(det)
        row._getTags = () => tags
        d.insertBefore(row,addBtn)
      }
      (data.items||[]).forEach(it=>addItem(it)); return d
    },
    ser(el) {
      const items=[]
      el.querySelector('.b-recipe')?.querySelectorAll('.recipe-item').forEach(row=>{
        const tags = row._getTags ? row._getTags() : [...row.querySelectorAll('.recipe-tag')].map(t => t.textContent.replace('×', '').trim())
        items.push({
          src:row.querySelector('.recipe-img-slot')?.dataset.src||'',
          name:row.querySelector('.recipe-name')?.textContent||'',
          desc:row.querySelector('.recipe-desc')?.textContent||'',
          price:row.querySelector('.recipe-price')?.textContent||'',
          tags
        })
      }); return {items}
    },
  },
  timeline: {
    label:'Timeline', icon:'⏱', cat:'special',
    def: () => ({ entries:[{day:'Day 1',title:'',body:''},{day:'Day 2',title:'',body:''}] }),
    render(data) {
      const d=ce('div','b-timeline')
      const addBtn=ce('button','tl-add'); addBtn.textContent='+ Add entry'
      addBtn.addEventListener('click',()=>addEntry({day:'',title:'',body:''}))
      d.appendChild(addBtn)
      function addEntry(entry) {
        const item=ce('div','tl-item')
        
        // Delete button
        const deleteBtn=ce('button','tl-item-delete')
        deleteBtn.innerHTML='×'
        deleteBtn.title='Delete entry'
        deleteBtn.addEventListener('click',(e)=>{
          e.stopPropagation()
          if(confirm('Delete this timeline entry?')){
            item.remove()
          }
        })
        
        const dotWrap=ce('div','tl-dot-wrap')
        const dot=ce('div','tl-dot'); const spine=ce('div','tl-spine')
        dotWrap.appendChild(dot); dotWrap.appendChild(spine)
        const body=ce('div','tl-body')
        const day=ce('div','tl-day'); day.contentEditable='true'; day.dataset.ph='Day 1'; day.textContent=entry.day||''
        const title=ce('div','tl-title'); title.contentEditable='true'; title.dataset.ph='What happened…'; title.textContent=entry.title||''
        const bodyTxt=ce('div','tl-body-text'); bodyTxt.contentEditable='true'; bodyTxt.dataset.ph='Describe the day…'; bodyTxt.innerHTML=entry.body||''
        body.appendChild(day); body.appendChild(title); body.appendChild(bodyTxt)
        item.appendChild(deleteBtn)
        item.appendChild(dotWrap)
        item.appendChild(body)
        d.insertBefore(item,addBtn)
      }
      (data.entries||[]).forEach(e=>addEntry(e)); return d
    },
    ser(el) {
      const entries=[]
      el.querySelector('.b-timeline')?.querySelectorAll('.tl-item').forEach(item=>{
        entries.push({day:item.querySelector('.tl-day')?.textContent||'', title:item.querySelector('.tl-title')?.textContent||'', body:item.querySelector('.tl-body-text')?.innerHTML||''})
      }); return {entries}
    },
  },
  location: {
    label:'Location', icon:'📍', cat:'special',
    def: () => ({ name:'', address:'', tags:['restaurant','cafe'], price:'$$' }),
    render(data) {
      const d=ce('div','b-location')
      const pin=ce('div','loc-pin'); pin.textContent='📍'
      const body=ce('div','loc-body')
      const nm=ce('div','loc-name'); nm.contentEditable='true'; nm.dataset.ph='Place name'; nm.textContent=data.name||''
      const addr=ce('div','loc-address'); addr.contentEditable='true'; addr.dataset.ph='Address, City, Country'; addr.textContent=data.address||''
      
      // Inline-editable tags
      const tagsDiv=ce('div','loc-tags')
      const tags = data.tags || ['restaurant']
      function renderTags() {
        tagsDiv.innerHTML = ''
        
        // Render existing tags as inline-editable
        tags.forEach((tag, idx) => {
          const chip = ce('span', 'loc-tag')
          const label = ce('span', 'tag-label')
          label.contentEditable = 'true'
          label.textContent = tag
          label.dataset.placeholder = 'tag'
          
          // Update tag on blur or enter
          label.addEventListener('blur', () => {
            const val = label.textContent.trim()
            if (val) tags[idx] = val
            else { tags.splice(idx, 1); renderTags() }
          })
          label.addEventListener('keydown', e => {
            if (e.key === 'Enter') { e.preventDefault(); label.blur() }
          })
          
          const removeBtn = ce('button', 'tag-remove')
          removeBtn.textContent = '×'
          removeBtn.addEventListener('click', (e) => {
            e.stopPropagation()
            tags.splice(idx, 1)
            renderTags()
          })
          
          chip.appendChild(label)
          chip.appendChild(removeBtn)
          tagsDiv.appendChild(chip)
        })
        
        // Plus button to add new tag
        const plusBtn = ce('button', 'tag-plus-btn')
        plusBtn.innerHTML = '+'
        plusBtn.title = 'Add tag'
        plusBtn.addEventListener('click', () => {
          tags.push('')
          renderTags()
          // Focus the new tag
          setTimeout(() => {
            const newTag = tagsDiv.querySelectorAll('.tag-label')[tags.length - 1]
            if (newTag) { newTag.focus() }
          }, 0)
        })
        tagsDiv.appendChild(plusBtn)
      }
      renderTags()
      
      body.appendChild(nm); body.appendChild(addr); body.appendChild(tagsDiv)
      const price=ce('div','loc-price'); price.contentEditable='true'; price.dataset.ph='$$'; price.textContent=data.price||'$$'
      d.appendChild(pin); d.appendChild(body); d.appendChild(price)
      d._getTags = () => tags
      return d
    },
    ser(el) {
      const tags = el._getTags ? el._getTags() : [...el.querySelectorAll('.loc-tag')].map(t => t.textContent.replace('×', '').trim())
      return {
        name:el.querySelector('.loc-name')?.textContent||'',
        address:el.querySelector('.loc-address')?.textContent||'',
        tags,
        price:el.querySelector('.loc-price')?.textContent||''
      }
    },
  },
  tags: {
    label:'Tags', icon:'🏷', cat:'special',
    def: () => ({ tags:[] }),
    render(data) {
      const d=ce('div','b-tags-block')
      const tags=[...(data.tags||[])]
      
      function render() {
        d.innerHTML=''
        
        // Render existing tags as inline-editable
        tags.forEach((t,i)=>{
          const chip=ce('span','b-tag-chip')
          const label=ce('span','tag-label')
          label.contentEditable='true'
          label.textContent=t
          label.dataset.placeholder='tag name'
          
          // Update tag on blur or enter
          label.addEventListener('blur',()=>{
            const val=label.textContent.trim()
            if(val) tags[i]=val
            else { tags.splice(i,1); render() }
          })
          label.addEventListener('keydown',e=>{
            if(e.key==='Enter'){ e.preventDefault(); label.blur() }
          })
          
          const removeBtn=ce('button','tag-remove')
          removeBtn.innerHTML='×'
          removeBtn.addEventListener('click',e=>{
            e.stopPropagation()
            tags.splice(i,1)
            render()
          })
          
          chip.appendChild(label)
          chip.appendChild(removeBtn)
          d.appendChild(chip)
        })
        
        // Plus button to add new tag
        const plusBtn=ce('button','tag-plus-btn')
        plusBtn.innerHTML='+'
        plusBtn.title='Add tag'
        plusBtn.addEventListener('click',()=>{
          tags.push('')
          render()
          // Focus the new tag
          setTimeout(()=>{
            const newTag=d.querySelectorAll('.tag-label')[tags.length-1]
            if(newTag){ newTag.focus() }
          },0)
        })
        d.appendChild(plusBtn)
      }
      
      render()
      d._getTags=()=>tags.filter(t=>t.trim())
      return d
    },
    ser(el) {
      const tags=el._getTags?el._getTags():[...el.querySelectorAll('.tag-label')].map(l=>l.textContent.trim()).filter(t=>t)
      return {tags}
    },
  },
}

// helpers
function ce(tag,cls){ const el=document.createElement(tag); el.className=cls; return el }
function qs(el,sel){ return el.querySelector?el.querySelector(sel):null }
function esc(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }
