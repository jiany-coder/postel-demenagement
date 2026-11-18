(function(){
  var hd=document.querySelector('.hd'),sent=document.createElement('div');
  sent.style.cssText='position:absolute;top:0;height:8px;width:1px';document.body.prepend(sent);
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(e){hd&&hd.classList.toggle('is-scrolled',!e[0].isIntersecting)}).observe(sent);
    var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}})},{rootMargin:'0px 0px -8% 0px'});
    document.querySelectorAll('.rv').forEach(function(el){io.observe(el)});
    var mbar=document.querySelector('.mbar'),ft=document.querySelector('.ft');
    var s2=document.createElement('div');s2.style.cssText='position:absolute;top:520px;height:1px;width:1px';document.body.prepend(s2);if(mbar){mbar.classList.add('top');new IntersectionObserver(function(e){mbar.classList.toggle('top',e[0].isIntersecting||e[0].boundingClientRect.top>0)}).observe(s2)}
    if(mbar&&ft)new IntersectionObserver(function(e){mbar.classList.toggle('hide',e[0].isIntersecting)}).observe(ft);
  }else{document.querySelectorAll('.rv').forEach(function(el){el.classList.add('in')})}
  var b=document.querySelector('.burger'),n=document.querySelector('.nav');
  if(b&&n)b.addEventListener('click',function(){var o=n.classList.toggle('open');hd.classList.toggle('menu-open',o);document.documentElement.style.setProperty('--hd-h',hd.getBoundingClientRect().height+'px');b.setAttribute('aria-expanded',o);document.body.style.overflow=o?'hidden':''});
})();
