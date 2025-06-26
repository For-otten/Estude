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

  let imagem = document.getElementById('newChannelImage').value;

  if (!imagem) {
    if (link.includes('youtube.com/watch?v=')) {
      const videoId = link.split('v=')[1].split('&')[0];
      imagem = `https://img.youtube.com/vi/${videoId}/0.jpg`;
    } else if (link.includes('youtu.be/')) {
      const videoId = link.split('youtu.be/')[1].split('?')[0];
      imagem = `https://img.youtube.com/vi/${videoId}/0.jpg`;
    }
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
  document.getElementById('newChannelImage').value = canal.image;
  document.getElementById('newChannelLanguage').value = canal.language;

  modoEdicao = true;
  indexEdicao = index;

  // Atualizar as opções de idioma no popup, conforme a categoria
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
      wrapperContainer.className = 'cards-wrapper'; // precisa ter position: relative no CSS

      const tituloTag = document.createElement('h2');
      tituloTag.innerText = tag;
      wrapperContainer.appendChild(tituloTag);

      const cardsContainer = document.createElement('div');
      cardsContainer.className = 'cards';

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

      // Scroll buttons behavior
      const scrollAmount = 2350;
      function aplicarClassePrimeiroCard(cardsContainer) {
        const cards = cardsContainer.querySelectorAll('.channel-card');
        cards.forEach(card => card.classList.remove('primeiro-na-esquerda'));

        cards.forEach(card => {
          const relativeLeft = card.offsetLeft - cardsContainer.scrollLeft;
          if (Math.abs(relativeLeft) < 6) {
            card.classList.add('primeiro-na-esquerda');
          }
        });
      }


      cardsContainer.addEventListener('scroll', () => {
        const cards = cardsContainer.querySelectorAll('.channel-card');

        // Remove a classe de todos antes
        cards.forEach(card => card.classList.remove('primeiro-na-esquerda'));

        const btnEsquerdaRect = btnEsquerda.getBoundingClientRect();

        cards.forEach(card => {
          const cardRect = card.getBoundingClientRect();

          // Posição relativa do card ao container para o scroll esquerdo
          const relativeLeft = card.offsetLeft - cardsContainer.scrollLeft;

          // 1. Card encostado na esquerda do container
          const encostadoEsquerda = Math.abs(relativeLeft) < 6;

          // 2. Card está embaixo (sobreposto) do botão esquerdo
          const sobreBotaoEsquerda = (
            cardRect.right > btnEsquerdaRect.left &&
            cardRect.left < btnEsquerdaRect.right &&
            cardRect.bottom > btnEsquerdaRect.top &&
            cardRect.top < btnEsquerdaRect.bottom
          );

          if (encostadoEsquerda || sobreBotaoEsquerda) {
            card.classList.add('primeiro-na-esquerda-button');
          }else{
            card.classList.remove('primeiro-na-esquerda-button');
          }
        });
      });

      btnDireita.addEventListener('click', () => {
        cardsContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      });

      btnEsquerda.addEventListener('click', () => {
        cardsContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      });

      cardsContainer.addEventListener('scroll', () => {
        btnEsquerda.style.display = cardsContainer.scrollLeft > 0 ? 'block' : 'none';
        btnDireita.style.display = (cardsContainer.scrollLeft + cardsContainer.clientWidth >= cardsContainer.scrollWidth - 1) ? 'none' : 'block';
      });

      // Adiciona no wrapper
      wrapperContainer.appendChild(btnEsquerda);
      wrapperContainer.appendChild(cardsContainer);
      wrapperContainer.appendChild(btnDireita);

      // Só exibe botões se houver conteúdo pra scrollar
      requestAnimationFrame(() => {
        if (cardsContainer.scrollWidth > cardsContainer.clientWidth) {
          btnEsquerda.style.display = 'none';
          btnDireita.style.display = 'block';
        } else {
          btnEsquerda.style.display = 'none';
          btnDireita.style.display = 'none';
        }
      });

      categoryContent.appendChild(wrapperContainer);
      aplicarClassePrimeiroCard(cardsContainer);

    }
  });

}

function prepararPopupParaNovoCanal() {
  mostrarPopup();

  const categoria = document.getElementById('titulo').innerText.replace('Canais de ', '');

  const idiomaSelect = document.getElementById('newChannelLanguage');
  const idiomaField = idiomaSelect.parentElement;

  // Limpar o campo de idioma antes de adicionar novas opções
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
        // Atualiza a categoria atual exibida
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
