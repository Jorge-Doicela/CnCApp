
const hoyTimestamp = new Date('2026-03-20').setHours(0, 0, 0, 0);

const trainings = [
  { id: 1, nombre: 'Mañana', estado: 'Activa', fechaInicio: '2026-03-21', horaInicio: '09:00' },
  { id: 2, nombre: 'Próxima semana', estado: 'Activa', fechaInicio: '2026-03-27', horaInicio: '10:00' },
  { id: 3, nombre: 'Ayer (Activa)', estado: 'Activa', fechaInicio: '2026-03-19', horaInicio: '08:00' },
  { id: 4, nombre: 'Terminada Ayer', estado: 'Finalizada', fechaInicio: '2026-03-19', horaInicio: '14:00' },
  { id: 5, nombre: 'Terminada la semana pasada', estado: 'Finalizada', fechaInicio: '2026-03-13', horaInicio: '09:00' },
  { id: 6, nombre: 'Cancelada', estado: 'Cancelada', fechaInicio: '2026-03-25', horaInicio: '11:00' },
  { id: 7, nombre: 'Hoy Temprano', estado: 'Activa', fechaInicio: '2026-03-20', horaInicio: '08:00' },
  { id: 8, nombre: 'Hoy Tarde', estado: 'Activa', fechaInicio: '2026-03-20', horaInicio: '18:00' },
];

function score(cap) {
  const estado = (cap.estado || '').toLowerCase();
  const fechaInicio = new Date(cap.fechaInicio || 0).getTime();
  const esFutura = fechaInicio >= hoyTimestamp;

  if (['activa', 'en progreso', 'pendiente', 'programada'].includes(estado) && esFutura) return 1;
  if (['activa', 'en progreso', 'pendiente', 'programada'].includes(estado) && !esFutura) return 2;
  if (['finalizada', 'realizada'].includes(estado)) return 3;
  if (estado === 'cancelada') return 4;
  return 5;
}

function getFullTime(cap) {
  const date = new Date(cap.fechaInicio || 0);
  if (cap.horaInicio) {
    const [h, m] = cap.horaInicio.split(':').map(Number);
    date.setHours(h || 0, m || 0, 0, 0);
  } else {
    date.setHours(0, 0, 0, 0);
  }
  return date.getTime();
}

const sorted = [...trainings].sort((a, b) => {
  const scoreA = score(a);
  const scoreB = score(b);
  
  if (scoreA !== scoreB) return scoreA - scoreB;
  
  const timeA = getFullTime(a);
  const timeB = getFullTime(b);
  
  if (scoreA === 1) {
    if (timeA === 0) return 1;
    if (timeB === 0) return -1;
    return timeA - timeB;
  } else {
    return timeB - timeA;
  }
});

console.log('Resultados de ordenamiento (Admin):');
sorted.forEach(t => console.log(`${t.id}: ${t.nombre} (${t.estado}) - ${t.fechaInicio} ${t.horaInicio}`));
