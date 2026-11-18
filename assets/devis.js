(function(){
  var form=document.getElementById('devis');if(!form)return;
  var INV=JSON.parse(document.getElementById('inv-data').textContent);
  var steps=[].slice.call(form.querySelectorAll('.step')),bars=[].slice.call(document.querySelectorAll('.prog i'));
  var label=document.querySelector('.prog-label'),cur=0,qty={},mode='calc',KEY='postel-devis-v1';
  var names=['Votre projet','Les adresses','Le volume','Les prestations','Vos coordonnées'];

  // ---------- Calculateur ----------
  var tabs=document.getElementById('tabs'),items=document.getElementById('items'),cats=Object.keys(INV),cat=cats[0];
  function k(c,i){return c+'|'+i}
  function vol(){
    if(mode==='surface'){var s=parseFloat(form.surface_calc.value)||0;return Math.round(s/2*10)/10}
    if(mode==='known'){return parseFloat(form.volume_known.value)||0}
    var t=0;cats.forEach(function(c){INV[c].forEach(function(x){t+=(qty[k(c,x[0])]||0)*x[1]})});return Math.round(t*10)/10;
  }
  function count(c){return INV[c].reduce(function(a,x){return a+(qty[k(c,x[0])]||0)},0)}
  function renderTabs(){
    tabs.innerHTML='';cats.forEach(function(c){var b=document.createElement('button');b.type='button';b.setAttribute('role','tab');b.setAttribute('aria-selected',c===cat);
      var n=count(c);b.innerHTML=c+(n?'<em>'+n+'</em>':'');b.onclick=function(){cat=c;renderTabs();renderItems()};tabs.appendChild(b)});
  }
  function renderItems(){
    items.innerHTML='';INV[cat].forEach(function(x){var id=k(cat,x[0]),q=qty[id]||0,d=document.createElement('div');d.className='it'+(q?' has':'');
      d.innerHTML='<span>'+x[0]+'<small>'+String(x[1]).replace('.',',')+' m³</small></span><div class="qty"><button type="button" aria-label="Retirer '+x[0]+'">−</button><output aria-live="polite">'+q+'</output><button type="button" aria-label="Ajouter '+x[0]+'">+</button></div>';
      var bs=d.querySelectorAll('button');bs[0].onclick=function(){set(id,Math.max(0,(qty[id]||0)-1))};bs[1].onclick=function(){set(id,(qty[id]||0)+1)};items.appendChild(d)});
  }
  function set(id,v){if(v)qty[id]=v;else delete qty[id];renderTabs();renderItems();sum();save()}
  function sum(){
    var v=vol(),el=document.getElementById('vol-total'),bar=document.getElementById('vol-bar'),list=document.getElementById('vol-list'),tr=document.getElementById('vol-truck');
    el.textContent=String(v).replace('.',',');var vi=document.getElementById('vol-inline');if(vi)vi.textContent=el.textContent;bar.style.width=Math.min(100,v/100*100)+'%';
    tr.textContent=v===0?'Ajoutez vos meubles pour estimer le volume.':v<=20?'Un porteur de 20 m³ suffit en général.':v<=40?'Un camion de 30 à 40 m³ est à prévoir.':v<=60?'Un grand porteur ou deux véhicules.':'Semi-remorque ou plusieurs véhicules : une visite technique est conseillée.';
    list.innerHTML='';if(mode==='calc')Object.keys(qty).forEach(function(id){var li=document.createElement('li');li.innerHTML='<span>'+qty[id]+' × '+id.split('|')[1]+'</span>';list.appendChild(li)});
    form.volume.value=v;
  }
  [].forEach.call(document.querySelectorAll('.vol-mode button'),function(b){b.onclick=function(){mode=b.dataset.mode;
    [].forEach.call(document.querySelectorAll('.vol-mode button'),function(x){x.setAttribute('aria-pressed',x===b)});
    [].forEach.call(document.querySelectorAll('[data-pane]'),function(p){p.hidden=p.dataset.pane!==mode});sum();save()}});
  form.surface_calc.addEventListener('input',sum);form.volume_known.addEventListener('input',sum);

  // ---------- Étapes ----------
  function show(i){cur=i;steps.forEach(function(s,j){s.classList.toggle('on',j===i)});bars.forEach(function(b,j){b.classList.toggle('on',j<=i)});
    label.textContent='Étape '+(i+1)+' sur '+steps.length+' : '+names[i];
    if(i===4)recap();var top=form.getBoundingClientRect().top+window.pageYOffset-100;if(window.pageYOffset>top)window.scrollTo({top:top,behavior:'smooth'});
    var f=steps[i].querySelector('input:not([type=hidden]),select');if(f&&i>0)setTimeout(function(){f.focus({preventScroll:true})},50)}
  function valid(i){var ok=true;
    [].forEach.call(steps[i].querySelectorAll('[data-req]'),function(w){var ins=w.querySelectorAll('input,select,textarea'),good;
      if(ins[0].type==='radio')good=[].some.call(ins,function(x){return x.checked});
      else if(ins[0].type==='checkbox')good=ins[0].checked;
      else good=ins[0].value.trim()!==''&&ins[0].checkValidity();
      w.classList.toggle('bad',!good);if(!good&&ok){ok=false;(ins[0]).focus()}});
    return ok}
  form.addEventListener('click',function(e){var t=e.target.closest('[data-next],[data-prev]');if(!t)return;e.preventDefault();
    if(t.hasAttribute('data-next')){if(valid(cur))show(Math.min(cur+1,steps.length-1))}else show(Math.max(cur-1,0));save()});

  function data(){var o={};[].forEach.call(form.elements,function(el){if(!el.name||el.type==='button'||el.type==='submit')return;
      if(el.type==='radio'){if(el.checked)o[el.name]=el.value}else if(el.type==='checkbox'){if(el.name==='options'){if(el.checked)(o.options=o.options||[]).push(el.value)}else o[el.name]=el.checked}else o[el.name]=el.value});
    o.inventaire=Object.keys(qty).map(function(id){return qty[id]+' x '+id.split('|')[1]});o.mode_volume=mode;return o}
  function recap(){var d=data(),r=document.getElementById('recap');
    var rows=[['Projet',(d.type||'')+(d.formule?' · '+d.formule:'')],['Départ',[d.dep_cp,d.dep_ville].join(' ')],['Arrivée',[d.arr_cp,d.arr_ville].join(' ')],['Date',d.date||'À définir'],['Volume estimé',(d.volume||0)+' m³'],['Prestations',(d.options||[]).join(', ')||'Aucune']];
    r.innerHTML='<dl>'+rows.map(function(x){return '<dt>'+x[0]+'</dt><dd>'+String(x[1]).replace(/</g,'&lt;')+'</dd>'}).join('')+'</dl>'}

  // ---------- Brouillon local ----------
  function save(){try{localStorage.setItem(KEY,JSON.stringify({d:data(),qty:qty,mode:mode}))}catch(e){}}
  function load(){try{var s=JSON.parse(localStorage.getItem(KEY)||'null');if(!s)return;qty=s.qty||{};
      Object.keys(s.d).forEach(function(n){var els=form.elements[n];if(!els||n==='website')return;
        if(els.length&&els[0]&&els[0].type==='radio'){[].forEach.call(els,function(x){x.checked=x.value===s.d[n]})}
        else if(els.type==='checkbox'&&n!=='consent'){els.checked=!!s.d[n]}else if(els.value!==undefined&&typeof s.d[n]==='string')els.value=s.d[n]});
      (s.d.options||[]).forEach(function(v){var x=form.querySelector('input[name=options][value="'+v+'"]');if(x)x.checked=true});
      if(s.mode){var b=document.querySelector('.vol-mode [data-mode="'+s.mode+'"]');if(b)b.click()}}catch(e){}}
  form.addEventListener('input',save);

  // Préremplissage depuis l'URL (?type=militaire)
  var p=new URLSearchParams(location.search).get('type');
  load();if(p){var r=form.querySelector('input[name=type][value="'+p+'"]');if(r)r.checked=true}
  renderTabs();renderItems();sum();show(0);

  // ---------- Envoi réel ----------
  form.addEventListener('submit',function(e){e.preventDefault();if(!valid(cur))return;
    var out=document.getElementById('result'),btn=form.querySelector('[type=submit]'),d=data();
    if(d.website){return}
    btn.disabled=true;btn.textContent='Envoi en cours…';out.className='result';
    fetch(form.action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)})
      .then(function(r){return r.json().catch(function(){return {ok:false}}).then(function(j){if(!r.ok||!j.ok)throw new Error(j.error||'send');return j})})
      .then(function(){out.className='result ok';out.innerHTML='<strong>Votre demande est bien envoyée.</strong><br>Un conseiller Postel vous rappelle sur le créneau choisi, du lundi au vendredi. Un récapitulatif part à votre adresse e-mail.';
        btn.textContent='Demande envoyée';try{localStorage.removeItem(KEY)}catch(e){}if(window.dataLayer)dataLayer.push({event:'devis_envoye'})})
      .catch(function(){var tel=form.dataset.tel,mail=form.dataset.mail;
        var body=encodeURIComponent(Object.keys(d).filter(function(x){return x!=='website'&&x!=='consent'}).map(function(x){return x+' : '+(Array.isArray(d[x])?d[x].join(', '):d[x])}).join('\n'));
        out.className='result ko';out.innerHTML='<strong>L\'envoi n\'a pas abouti.</strong> Votre demande n\'a pas été transmise. Appelez-nous au <a href="tel:'+tel.replace(/\s/g,'')+'">'+tel+'</a> ou <a href="mailto:'+mail+'?subject='+encodeURIComponent('Demande de devis déménagement')+'&body='+body+'">envoyez-la par e-mail</a> : toutes vos réponses sont déjà dans le message.';
        btn.disabled=false;btn.textContent='Réessayer l\'envoi'});
  });
})();
