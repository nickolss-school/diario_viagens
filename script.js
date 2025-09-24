document.addEventListener("DOMContentLoaded", () => {
  const formDiario = document.getElementById("formDiario");
  const entradasSection = document.getElementById("entradas");
  const btnAdicionarLocalizacao = document.getElementById(
    "btnAdicionarLocalizacao"
  );
  const localizacaoStatus = document.getElementById("localizacaoStatus");
  const latitudeInput = document.getElementById("latitude");
  const longitudeInput = document.getElementById("longitude");
  const avaliacaoInput = document.getElementById("avaliacao");
  const avaliacaoValorSpan = document.getElementById("avaliacaoValor");
  const noEntriesMessage = document.getElementById("noEntriesMessage");

  const btnCitar = document.getElementById("btnCitar");
  const citacaoContainer = document.getElementById("citacaoContainer");
  const citacaoTexto = document.getElementById("citacaoTexto");
  const citacaoAutor = document.getElementById("citacaoAutor");

  avaliacaoInput.addEventListener("input", () => {
    avaliacaoValorSpan.textContent = avaliacaoInput.value;
  });

  formDiario.addEventListener("submit", (event) => {
    event.preventDefault();

    const novaEntrada = {
      id: Date.now(),
      titulo: document.getElementById("titulo").value,
      dataVisita: document.getElementById("dataVisita").value,
      fotoUrl: document.getElementById("fotoUrl").value,
      descricao: document.getElementById("descricao").value,
      avaliacao: document.getElementById("avaliacao").value,
      latitude: latitudeInput.value,
      longitude: longitudeInput.value,
      timestamp: new Date().toISOString(),
    };

    let entradas = JSON.parse(localStorage.getItem("diarioViagens")) || [];
    entradas.push(novaEntrada);
    localStorage.setItem("diarioViagens", JSON.stringify(entradas));

    formDiario.reset(); 
    latitudeInput.value = "";
    longitudeInput.value = "";
    localizacaoStatus.textContent = "";
    avaliacaoInput.value = "3";
    avaliacaoValorSpan.textContent = "3";

    carregarEntradas();
  });

  function carregarEntradas() {
    entradasSection.innerHTML =
      '<h2 class="text-2xl font-semibold mb-4 text-blue-700">Minhas Memórias de Viagem</h2>';
    let entradas = JSON.parse(localStorage.getItem("diarioViagens")) || [];

    if (entradas.length === 0) {
      noEntriesMessage.classList.remove("hidden");
      entradasSection.appendChild(noEntriesMessage);
      return;
    } else {
      noEntriesMessage.classList.add("hidden");
    }

    entradas.sort((a, b) => new Date(b.dataVisita) - new Date(a.dataVisita));

    entradas.forEach((entrada) => {
      const article = document.createElement("article");
      article.id = `entrada-${entrada.id}`;
      article.classList.add(
        "bg-white",
        "p-6",
        "rounded-lg",
        "shadow-md",
        "border-l-4",
        "border-blue-500"
      );

      let fotoHtml = "";
      if (entrada.fotoUrl) {
        fotoHtml = `
                    <figure class="mb-4">
                        <img src="${entrada.fotoUrl}" alt="Foto de ${entrada.titulo}" class="w-full h-48 object-cover rounded-md shadow-sm">
                        <figcaption class="text-sm text-gray-600 mt-2 text-center">Imagem de ${entrada.titulo}</figcaption>
                    </figure>
                `;
      }

      let localizacaoHtml = "";
      if (entrada.latitude && entrada.longitude) {
        localizacaoHtml = `
                    <p class="text-sm text-gray-600 mt-2">
                        <strong>Localização:</strong> Lat ${entrada.latitude}, Long ${entrada.longitude}
                        <a href="https://www.google.com/maps?q=${entrada.latitude},${entrada.longitude}" target="_blank" class="text-blue-500 hover:underline ml-2">Ver no Mapa</a>
                    </p>
                `;
      }

      article.innerHTML = `
                <h3 class="text-xl font-bold text-blue-700 mb-2">${
                  entrada.titulo
                }</h3>
                <p class="text-gray-600 text-sm mb-3"><strong>Data da Visita:</strong> ${new Date(
                  entrada.dataVisita
                ).toLocaleDateString("pt-BR")}</p>
                ${fotoHtml}
                <p class="text-gray-800 mb-3">${entrada.descricao}</p>
                <p class="text-gray-700 text-sm mb-3"><strong>Avaliação:</strong> ${"⭐".repeat(
                  parseInt(entrada.avaliacao)
                )}</p>
                ${localizacaoHtml}
                <button class="btn-excluir bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm mt-4 transition duration-300" data-id="${
                  entrada.id
                }">
                    Excluir
                </button>
            `;
      entradasSection.appendChild(article);
    });

    document.querySelectorAll(".btn-excluir").forEach((button) => {
      button.addEventListener("click", (event) => {
        const idParaExcluir = parseInt(event.target.dataset.id);
        excluirEntrada(idParaExcluir);
      });
    });
  }

  btnAdicionarLocalizacao.addEventListener("click", () => {
    localizacaoStatus.textContent = "Obtendo localização...";
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          latitudeInput.value = position.coords.latitude;
          longitudeInput.value = position.coords.longitude;
          localizacaoStatus.textContent = `Localização obtida! Lat: ${position.coords.latitude.toFixed(
            4
          )}, Long: ${position.coords.longitude.toFixed(4)}`;
          localizacaoStatus.classList.remove("text-red-500");
          localizacaoStatus.classList.add("text-green-600");
        },
        (error) => {
          localizacaoStatus.textContent = `Erro ao obter localização: ${error.message} e ${position.coords.latitude}`;
          localizacaoStatus.classList.remove("text-green-600");
          localizacaoStatus.classList.add("text-red-500");
          latitudeInput.value = "";
          longitudeInput.value = "";
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      localizacaoStatus.textContent =
        "Geolocalização não é suportada por este navegador.";
      localizacaoStatus.classList.remove("text-green-600");
      localizacaoStatus.classList.add("text-red-500");
    }
  });

  function excluirEntrada(id) {
    let entradas = JSON.parse(localStorage.getItem("diarioViagens")) || [];
    entradas = entradas.filter((entrada) => entrada.id !== id);
    localStorage.setItem("diarioViagens", JSON.stringify(entradas));
    carregarEntradas();
  }

  btnCitar.addEventListener("click", async () => {
    try {
      const response = await fetch("https://api.adviceslip.com/advice");
      const data = await response.json();
      citacaoTexto.textContent = `"${data.slip.advice}"`;
      citacaoContainer.classList.remove("hidden");
    } catch (error) {
      console.error("Erro ao buscar citação:", error);
      citacaoTexto.textContent = "Não foi possível carregar a citação do dia.";
      citacaoAutor.textContent = "";
      citacaoContainer.classList.remove("hidden");
    }
  });

  carregarEntradas();
});
