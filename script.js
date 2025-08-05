let modoEdicao = false;
let indexEdicao = null;

let canaisPorCategoria = {
  'Programação': [],
  'Idiomas': [],
};

function carregarCanaisDoLocalStorage() {
  const storedData = localStorage.getItem('canaisPorCategoria');
  if (storedData) {
    canaisPorCategoria = JSON.parse(storedData);
  }
}

function salvarCanaisNoLocalStorage() {
  localStorage.setItem('canaisPorCategoria', JSON.stringify(canaisPorCategoria));
}

function mostrarPopup() {
  document.getElementById('popup').style.display = 'flex';
}

function fecharPopup() {
  document.getElementById('popup').style.display = 'none';
}

function salvarCanal() {
  const nome = document.getElementById('newChannelName').value;
  const descricao = document.getElementById('newChannelDescription').value;
  const link = document.getElementById('newChannelLink').value;
  let imagem = document.getElementById('newChannelImage').value.trim();

  function gerarImagemAutomaticamente(nome, link) {
    if (link.includes('youtube.com/watch?v=')) {
      const videoId = link.split('v=')[1].split('&')[0];
      return `https://img.youtube.com/vi/${videoId}/0.jpg`;
    } else if (link.includes('youtu.be/')) {
      const videoId = link.split('youtu.be/')[1].split('?')[0];
      return `https://img.youtube.com/vi/${videoId}/0.jpg`;
    } else {
      const cor = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

      function corEhClara(hex) {
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        const brilho = (r * 299 + g * 587 + b * 114) / 1000;
        return brilho > 160;
      }

      const texto = encodeURIComponent(nome.slice(0, 30));
      const corTexto = corEhClara(cor) ? '000' : 'fff';
      return `https://placehold.co/400x225/${cor}/${corTexto}?text=${texto}`;
    }
  }

  const urlPadraoPlacehold = imagem.startsWith('https://placehold.co/');
  const urlThumbYoutube = imagem.includes('img.youtube.com/vi/');

  if (!imagem || urlPadraoPlacehold || urlThumbYoutube) {
    imagem = gerarImagemAutomaticamente(nome, link);
  }


  const categoria = document.getElementById('titulo').innerText.replace('Canais de ', '');
  const idioma = document.getElementById('newChannelLanguage').value;
  const tag = categoria === 'Programação' ? document.getElementById('newChannelTag').value : '';

  if (!nome || !descricao || !link) {
    alert("Preencha todos os campos obrigatórios.");
    return;
  }

  const canal = {
    name: nome,
    description: descricao,
    link: link,
    image: imagem,
    language: idioma,
    tag: tag,
  };

  if (modoEdicao) {
    canaisPorCategoria[categoria][indexEdicao] = canal;
    modoEdicao = false;
    indexEdicao = null;
  } else {
    if (!canaisPorCategoria[categoria]) {
      canaisPorCategoria[categoria] = [];
    }
    canaisPorCategoria[categoria].push(canal);
  }

  salvarCanaisNoLocalStorage();
  carregarCategoria(categoria);
  fecharPopup();
}

function abrirCanal(link) {
  window.open(link, '_blank');
}

document.querySelector('.sidebar').addEventListener('click', function (event) {
  if (event.target.tagName === 'LI') {
    document.querySelectorAll('.sidebar li').forEach(li => li.classList.remove('active'));
    event.target.classList.add('active');

    const categoriaSelecionada = event.target.innerText;
    carregarCategoria(categoriaSelecionada);
  }
});

window.onload = function () {
  carregarCanaisDoLocalStorage();

  const listaCategorias = document.querySelectorAll('.sidebar li');
  listaCategorias.forEach(li => li.classList.remove('active'));

  const primeiraCategoria = Array.from(listaCategorias).find(li => li.innerText === 'Idiomas');
  if (primeiraCategoria) {
    primeiraCategoria.classList.add('active');
    carregarCategoria('Idiomas');
  }
};

function editarCanal(categoria, index) {
  const canal = canaisPorCategoria[categoria][index];

  document.getElementById('newChannelName').value = canal.name;
  document.getElementById('newChannelDescription').value = canal.description;
  document.getElementById('newChannelLink').value = canal.link;

  const imagem = canal.image || '';
  const ehImagemAutomatica =
    imagem.startsWith('https://placehold.co/') ||
    imagem.includes('img.youtube.com/vi/');

  document.getElementById('newChannelImage').value = ehImagemAutomatica ? '' : imagem;

  document.getElementById('newChannelLanguage').value = canal.language;

  modoEdicao = true;
  indexEdicao = index;

  prepararPopupParaNovoCanal();

  mostrarPopup();
}



function atualizarCanal(categoria, index) {
  const nome = document.getElementById('newChannelName').value;
  const descricao = document.getElementById('newChannelDescription').value;
  const link = document.getElementById('newChannelLink').value;
  const imagem = document.getElementById('newChannelImage').value;
  const idioma = document.getElementById('newChannelLanguage').value;

  if (nome && descricao && link) {
    canaisPorCategoria[categoria][index] = {
      name: nome,
      description: descricao,
      link: link,
      image: imagem,
      language: idioma
    };

    salvarCanaisNoLocalStorage();

    carregarCategoria(categoria);

    fecharPopup();
  } else {
    alert("Por favor, preencha todos os campos.");
  }
}

function excluirCanal(categoria, index) {
  canaisPorCategoria[categoria].splice(index, 1);

  salvarCanaisNoLocalStorage();

  carregarCategoria(categoria);
}

function carregarCategoria(categoria) {
  const categoryContent = document.getElementById('categoryContent');
  const titulo = document.getElementById('titulo');

  const scrollPositions = {};
  const wrappersExistentes = categoryContent.querySelectorAll('.cards-wrapper');
  wrappersExistentes.forEach(wrapper => {
    const tagTitulo = wrapper.querySelector('h2')?.innerText;
    const cardsContainer = wrapper.querySelector('.cards');
    if (tagTitulo && cardsContainer) {
      scrollPositions[tagTitulo] = cardsContainer.scrollLeft;
    }
  });
  function aplicarClassePrimeiroCard(cardsContainer) {
    const cards = cardsContainer.querySelectorAll('.channel-card');
    cards.forEach(card => card.removeAttribute('id'));

    if (cards.length === 0) return;

    const verticalLayout = cards.length > 1 && cards[0].offsetTop !== cards[1].offsetTop;

    let primeiroCard = null;

    if (verticalLayout) {
      primeiroCard = Array.from(cards).sort((a, b) => a.offsetTop - b.offsetTop)[0];
    } else {
      primeiroCard = Array.from(cards).find(card => {
        const relativeLeft = card.offsetLeft - cardsContainer.scrollLeft;
        return Math.abs(relativeLeft) < 6;
      }) || cards[0]; 
    }

    if (primeiroCard) {
      primeiroCard.id = 'primeiro-na-esquerda';
    }
  }


  titulo.innerHTML = `Canais de ${categoria}`;
  const cadastrarbnt = document.getElementById('cadastrarBtn');
  categoryContent.innerHTML = '';
  cadastrarbnt.style.display = 'inline-block';

  const listaCanais = (canaisPorCategoria[categoria] || []).filter(c => c != null);

  const tagsUnicas = [...new Set(
    listaCanais
      .filter(c => c.language != null && c.language !== '')
      .map(c => c.language)
  )];

  tagsUnicas.forEach(tag => {
    const canaisPorTag = listaCanais.filter(c => c.language === tag);

    if (canaisPorTag.length) {
      const wrapperContainer = document.createElement('div');
      wrapperContainer.className = 'cards-wrapper';

      const tituloTag = document.createElement('h2');
      tituloTag.innerText = tag;
      wrapperContainer.appendChild(tituloTag);

      const cardsContainer = document.createElement('div');
      cardsContainer.className = 'cards';
      aplicarClassePrimeiroCard(cardsContainer);
      const btnEsquerda = document.createElement('button');
      btnEsquerda.className = 'tras';
      btnEsquerda.textContent = '<';

      const btnDireita = document.createElement('button');
      btnDireita.className = 'frente';
      btnDireita.textContent = '>';

      for (let i = 0; i < canaisPorTag.length; i += 6) {
        const scrollDiv = document.createElement('div');
        scrollDiv.className = 'channelscroll';

        canaisPorTag.slice(i, i + 6).forEach(canal => {
          const card = document.createElement('div');
          card.className = 'channel-card';
          card.innerHTML = `
          <h3>${canal.name}</h3>
          ${canal.image ? `<img src="${canal.image}" alt="${canal.name}" class="channel-thumbnail">` : ''}
          <p>${canal.description}</p>
          <div class="btns">
            <button class="btnedit">Editar</button>
            <button class="btnedelete">Deletar</button>
          </div>
          `;

          card.onclick = () => abrirCanal(canal.link);

          const btnEdit = card.querySelector('.btnedit');
          const btnDelete = card.querySelector('.btnedelete');

          btnEdit.addEventListener('click', (event) => {
            event.stopPropagation();
            const indexNoArrayCompleto = canaisPorCategoria[categoria].indexOf(canal);
            editarCanal(categoria, indexNoArrayCompleto);
          });

          btnDelete.addEventListener('click', (event) => {
            event.stopPropagation();
            const indexNoArrayCompleto = canaisPorCategoria[categoria].indexOf(canal);
            excluirCanal(categoria, indexNoArrayCompleto);
          });

          scrollDiv.appendChild(card);
        });

        cardsContainer.appendChild(scrollDiv);
      }

      const scrollAmount = 2350;



      function atualizarVisibilidadeBotoes() {
        if (cardsContainer.scrollWidth > cardsContainer.clientWidth) {
          btnEsquerda.style.display = cardsContainer.scrollLeft > 0 ? 'block' : 'none';
          btnDireita.style.display = (cardsContainer.scrollLeft + cardsContainer.clientWidth >= cardsContainer.scrollWidth - 1) ? 'none' : 'block';
        } else {
          btnEsquerda.style.display = 'none';
          btnDireita.style.display = 'none';
        }
      }

      cardsContainer.addEventListener('scroll', () => {
        const cards = cardsContainer.querySelectorAll('.channel-card');

        cards.forEach(card => card.classList.remove('primeiro-na-esquerda'));

        const btnEsquerdaRect = btnEsquerda.getBoundingClientRect();
        cards.forEach(card => {
          const cardRect = card.getBoundingClientRect();

          const larguraCard = cardRect.width;

          const distanciaDoBotao = cardRect.left - btnEsquerdaRect.right;
          const tolerancia = 25;
          const profundidade = tolerancia - distanciaDoBotao;
          card.classList.remove('primeiro-na-esquerda-button');
          card.style.removeProperty('--deslocamento-hover');

          const limite = 0.4;
          const deslocamentoMaximo = 40;

          if (profundidade > 0 && profundidade < larguraCard * limite) {
            const percentual = profundidade / (larguraCard * limite);
            const curva = Math.pow(percentual, 0.9);
            const deslocamento = deslocamentoMaximo * curva;

            card.classList.add('primeiro-na-esquerda-button');
            card.style.setProperty('--deslocamento-hover', `${deslocamento}%`);
          }

        });


        atualizarVisibilidadeBotoes();
      });

      btnDireita.addEventListener('click', () => {
        cardsContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      });

      btnEsquerda.addEventListener('click', () => {
        cardsContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      });

      cardsContainer.addEventListener('scrollend', atualizarVisibilidadeBotoes);

      wrapperContainer.appendChild(btnEsquerda);
      wrapperContainer.appendChild(cardsContainer);
      wrapperContainer.appendChild(btnDireita);

      categoryContent.appendChild(wrapperContainer);

      if (scrollPositions[tag]) {
        cardsContainer.scrollLeft = scrollPositions[tag];
      }

      requestAnimationFrame(() => {
        atualizarVisibilidadeBotoes();
        aplicarClassePrimeiroCard(cardsContainer);
      });
    }
  });
}



function prepararPopupParaNovoCanal() {
  mostrarPopup();

  const categoria = document.getElementById('titulo').innerText.replace('Canais de ', '');

  const idiomaSelect = document.getElementById('newChannelLanguage');
  const idiomaField = idiomaSelect.parentElement;

  idiomaSelect.innerHTML = '';

  if (categoria === 'Programação') {
    idiomaField.style.display = 'block';
    ['Estrutura de dados', 'Gamedev', 'Algoritmos'].forEach(lang => {
      const option = document.createElement('option');
      option.value = lang;
      option.textContent = lang;
      idiomaSelect.appendChild(option);
    });
  } else {
    idiomaField.style.display = 'block';
    ['Inglês', 'Francês', 'Japonês', 'Chinês'].forEach(lang => {
      const option = document.createElement('option');
      option.value = lang;
      option.textContent = lang;
      idiomaSelect.appendChild(option);
    });
  }
}

function exportarConteudo() {
  const dataStr = JSON.stringify(canaisPorCategoria, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'conteudo_backup.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}


function importarConteudo(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedData = JSON.parse(e.target.result);
      if (typeof importedData === 'object' && importedData !== null) {
        canaisPorCategoria = importedData;
        salvarCanaisNoLocalStorage();
        const categoriaAtual = document.querySelector('.sidebar li.active')?.innerText;
        if (categoriaAtual) carregarCategoria(categoriaAtual);
        alert('Canais importados com sucesso!');
      } else {
        alert('Formato de arquivo inválido.');
      }
    } catch (err) {
      alert('Erro ao importar o arquivo: ' + err.message);
    }
  };
  reader.readAsText(file);
}
const container = document.querySelector('.container');
const btnContainer = document.querySelector('.cadastrarBtnConteiner');
const LIMITE_MINIMO_DE_SCROLL = 100;

if (container && btnContainer) {
  container.addEventListener('scroll', function () {
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    const scrollDisponivel = scrollHeight - clientHeight;

    // Só ativa se houver scroll suficiente
    if (scrollDisponivel > LIMITE_MINIMO_DE_SCROLL) {
      if (scrollTop + clientHeight >= scrollHeight - 5) {
        btnContainer.style.display = 'none';
      } else {
        btnContainer.style.display = 'block';
      }
    } else {
      // Se não houver conteúdo suficiente para rolar, botão sempre visível
      btnContainer.style.display = 'block';
    }
  });
}

