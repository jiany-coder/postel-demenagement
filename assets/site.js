(function(){
  var d=document,hd=d.querySelector('.hd');
  // En-tête compact au défilement
  var s=d.createElement('div');s.style.cssText='position:absolute;top:0;height:40px;width:1px;pointer-events:none';d.body.prepend(s);
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(e){hd&&hd.classList.toggle('is-scrolled',!e[0].isIntersecting)}).observe(s);
    var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}})},{rootMargin:'0px 0px -8% 0px'});
    d.querySelectorAll('.rv').forEach(function(el){io.observe(el)});
    var mbar=d.querySelector('.mbar'),ft=d.querySelector('.ft');
    if(mbar){var s2=d.createElement('div');s2.style.cssText='position:absolute;top:560px;height:1px;width:1px;pointer-events:none';d.body.prepend(s2);mbar.classList.add('top');
      new IntersectionObserver(function(e){mbar.classList.toggle('top',e[0].isIntersecting||e[0].boundingClientRect.top>0)}).observe(s2);
      if(ft)new IntersectionObserver(function(e){mbar.classList.toggle('hide',e[0].isIntersecting)}).observe(ft)}
  }else{d.querySelectorAll('.rv').forEach(function(el){el.classList.add('in')})}

  // Méga-menu : clic, survol (souris), Échap, clic extérieur
  var items=[].slice.call(d.querySelectorAll('.ni.has-mega')),timer;
  function close(except){items.forEach(function(n){if(n!==except){n.classList.remove('open');n.querySelector('.nl').setAttribute('aria-expanded','false')}})}
  function open(n){close(n);n.classList.add('open');n.querySelector('.nl').setAttribute('aria-expanded','true')}
  var fine=window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  items.forEach(function(n){var b=n.querySelector('.nl');
    b.addEventListener('click',function(){n.classList.contains('open')?close():open(n)});
    if(fine){n.addEventListener('mouseenter',function(){clearTimeout(timer);timer=setTimeout(function(){open(n)},90)});
      n.addEventListener('mouseleave',function(){clearTimeout(timer);timer=setTimeout(function(){n.classList.remove('open');b.setAttribute('aria-expanded','false')},160)})}
  });
  d.addEventListener('keydown',function(e){if(e.key==='Escape'){var o=d.querySelector('.ni.open');close();if(o)o.querySelector('.nl').focus();closeM()}});
  d.addEventListener('click',function(e){if(!e.target.closest('.ni'))close()});

  // Navigation mobile
  var bu=d.querySelector('.burger'),mn=d.getElementById('mnav'),last;
  function openM(){if(!mn)return;last=d.activeElement;mn.classList.add('open');mn.removeAttribute('aria-hidden');bu.setAttribute('aria-expanded','true');d.documentElement.classList.add('lock');setTimeout(function(){var c=mn.querySelector('.mnav-close');c&&c.focus()},60)}
  function closeM(){if(!mn||!mn.classList.contains('open'))return;mn.classList.remove('open');mn.setAttribute('aria-hidden','true');bu.setAttribute('aria-expanded','false');d.documentElement.classList.remove('lock');last&&last.focus&&last.focus()}
  if(bu)bu.addEventListener('click',openM);
  if(mn){mn.querySelector('.mnav-close').addEventListener('click',closeM);
    mn.addEventListener('click',function(e){if(e.target.closest('a'))closeM()});
    mn.addEventListener('keydown',function(e){if(e.key!=='Tab')return;var f=[].filter.call(mn.querySelectorAll('a,button,summary'),function(x){return x.offsetParent!==null});if(!f.length)return;
      if(e.shiftKey&&d.activeElement===f[0]){e.preventDefault();f[f.length-1].focus()}else if(!e.shiftKey&&d.activeElement===f[f.length-1]){e.preventDefault();f[0].focus()}})}
  window.addEventListener('resize',function(){if(window.innerWidth>1100)closeM()});

  // Formulaires simples (rappel) : envoi réel, jamais de faux succès
  d.querySelectorAll('form[data-api]').forEach(function(f){f.addEventListener('submit',function(e){e.preventDefault();
    var ok=true;f.querySelectorAll('[data-req]').forEach(function(w){var i=w.querySelector('input,select,textarea'),g=i.type==='checkbox'?i.checked:(i.value.trim()!==''&&i.checkValidity());w.classList.toggle('bad',!g);if(!g&&ok){ok=false;i.focus()}});
    if(!ok)return;var o={};[].forEach.call(f.elements,function(x){if(!x.name)return;o[x.name]=x.type==='checkbox'?x.checked:x.value});if(o.website)return;
    var out=f.querySelector('.result'),btn=f.querySelector('[type=submit]'),t=btn.textContent;btn.disabled=true;btn.textContent='Envoi en cours…';out.className='result';
    fetch(f.getAttribute('data-api'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(o)}).then(function(r){return r.json().catch(function(){return{}}).then(function(j){if(!r.ok||!j.ok)throw 0})})
      .then(function(){out.className='result ok';out.innerHTML='<strong>Demande bien reçue.</strong> Un conseiller Postel vous rappelle sur le créneau choisi, du lundi au vendredi.';btn.textContent='Demande envoyée'})
      .catch(function(){out.className='result ko';out.innerHTML='<strong>L\'envoi n\'a pas abouti</strong>, votre demande n\'a pas été transmise. Appelez-nous directement au <a href="tel:+33235724151">02 35 72 41 51</a>.';btn.disabled=false;btn.textContent=t})
  })});
})();
