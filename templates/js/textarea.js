const areas = document.querySelectorAll('.textarea');
areas.forEach(el => {
  el.style.lineHeight = '1em';
  el.rows = 1;
  el.style.height = '1em';
  el.style.width = '10ch';
});
