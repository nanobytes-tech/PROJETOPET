document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('app-container');
  const template = document.getElementById('map-template');
  const clone = template.content.cloneNode(true);
  container.appendChild(clone);

  const map = L.map('map-container').setView([-23.55052, -46.633308], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
  }).addTo(map);

  const marcadores = [
    {
      tipo: 'Cachorro',
      coords: [-23.55052, -46.633308],
      mensagem: 'Cachorro perdido aqui!',
    },
    {
      tipo: 'Gato',
      coords: [-23.554, -46.638],
      mensagem: 'Gato visto nesta área.',
    },
  ];

  const markerLayer = L.layerGroup().addTo(map);

  function renderizarMarcadores(tipo) {
    markerLayer.clearLayers();
    const filtrados = tipo === 'Todos' ? marcadores : marcadores.filter(m => m.tipo === tipo);
    filtrados.forEach(m => {
      const marker = L.marker(m.coords).bindPopup(m.mensagem);
      markerLayer.addLayer(marker);
    });
  }

  renderizarMarcadores('Todos');

  document.querySelectorAll('.map-filter-btn').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.map-filter-btn').forEach(btn => {
        btn.classList.remove('active-filter');
        btn.setAttribute('aria-pressed', 'false');
      });

      button.classList.add('active-filter');
      button.setAttribute('aria-pressed', 'true');

      const tipo = button.dataset.filter;
      renderizarMarcadores(tipo);
    });
  });

  // Modal
  const btnRegistrar = document.getElementById('btn-registrar');
  const modal = document.getElementById('modal');
  const form = document.getElementById('form-alerta');
  const btnCancelar = document.getElementById('cancelar');

  btnRegistrar.addEventListener('click', () => {
    modal.classList.remove('hidden');
  });

  btnCancelar.addEventListener('click', () => {
    modal.classList.add('hidden');
    form.reset();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const tipo = document.getElementById('tipo').value;
    const descricao = document.getElementById('descricao').value.trim();

    // Tentativa de usar localização atual
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          adicionarAlerta(lat, lng, tipo, `${nome}: ${descricao}`);
        },
        () => {
          // Falhou? Usa centro do mapa
          const center = map.getCenter();
          adicionarAlerta(center.lat, center.lng, tipo, `${nome}: ${descricao}`);
        }
      );
    } else {
      const center = map.getCenter();
      adicionarAlerta(center.lat, center.lng, tipo, `${nome}: ${descricao}`);
    }

    modal.classList.add('hidden');
    form.reset();
  });

  function adicionarAlerta(lat, lng, tipo, mensagem) {
    marcadores.push({
      tipo,
      coords: [lat, lng],
      mensagem,
    });
    renderizarMarcadores(document.querySelector('.map-filter-btn.active-filter').dataset.filter);
  }
});
