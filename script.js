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
  const imagem = document.getElementById('newChannelImage').value;
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

document.querySelector('.sidebar').addEventListener('click', function(event) {
  if (event.target.tagName === 'LI') {
    document.querySelectorAll('.sidebar li').forEach(li => li.classList.remove('active'));
    event.target.classList.add('active');

    const categoriaSelecionada = event.target.innerText;
    carregarCategoria(categoriaSelecionada);
  }
});

window.onload = function() {
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

  // Remove itens nulos do array
  const listaCanais = (canaisPorCategoria[categoria] || []).filter(c => c != null);

  // Filtra somente itens com language válido e não vazio
  const tagsUnicas = [...new Set(
    listaCanais
      .filter(c => c.language != null && c.language !== '')
      .map(c => c.language)
  )];



tagsUnicas.forEach(tag => {
  const canaisPorTag = listaCanais.filter(c => c.language === tag);

  if (canaisPorTag.length) {
    const tituloTag = document.createElement('h2');
    tituloTag.innerText = tag;
    categoryContent.appendChild(tituloTag);

    canaisPorTag.forEach((canal, index) => {
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

      // Resto dos eventos (mouseenter, click edit/delete etc.)
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

      categoryContent.appendChild(card);
    });
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
    ['Inglês', 'Francês', 'Japonês'].forEach(lang => {
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
  reader.onload = function(e) {
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
