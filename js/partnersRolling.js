const list = document.querySelector(".partner_list");

list.innerHTML += list.innerHTML + list.innerHTML;

const listWidth = list.scrollWidth / 3;

gsap.to(list, {
  x: -listWidth,        
  duration: 50,
  ease: "none",
  repeat: -1,
  modifiers: {
    x: gsap.utils.unitize(x => {
      let pos = parseFloat(x);
      if (pos <= -listWidth) {
        pos += listWidth; 
      }
      return pos;
    })
  }
});


const inner = document.querySelector(".culture_inner");
const items = gsap.utils.toArray(".culture_item");

inner.innerHTML += inner.innerHTML; 

let totalHeight = inner.scrollHeight / 2; 

gsap.to(inner, {
  y: -totalHeight, 
  duration: 40,     
  ease: "linear",
  repeat: -1
});

gsap.to(items, {
  yPercent: -200, 
  duration: 40,
  ease: "linear",
  repeat: -1,
  modifiers: {
    yPercent: gsap.utils.unitize(y => {
      const wrapped = y % 200; 
      return wrapped;
    })
  },
  onUpdate: function() {
    document.querySelectorAll(".culture_item").forEach(item => {
      let rect = item.getBoundingClientRect();
      let parentRect = document.querySelector(".culture_list").getBoundingClientRect();

      let fadeZone = parentRect.height * 0.2;
      let distTop = rect.top - parentRect.top;
      let distBottom = parentRect.bottom - rect.bottom;

      if (distTop < fadeZone) {
        item.style.opacity = distTop / fadeZone; 
      } else if (distBottom < fadeZone) {
        item.style.opacity = distBottom / fadeZone; 
      } else {
        item.style.opacity = 1;
      }
    });
  }
});
