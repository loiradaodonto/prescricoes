$(document).ready(function() {
  let data = [];

  // Função para buscar dados da API Flask
  function fetchData() {
      $.getJSON('https://xvencedor.pythonanywhere.com/medicacoes', function(response) {
          data = response;
          populateDiseaseList();
      });
  }

  function populateDiseaseList() {
      const sortedData = data.sort((a, b) => a.DOENCA.localeCompare(b.DOENCA));
      $('#disease-list').empty();
      sortedData.forEach((item, index) => {
          const disease = item.DOENCA;
          const listItem = $('<a>').text(`${index + 1}) ${disease}`).addClass('block py-2 px-4 text-gray-700 hover:bg-gray-100 transition-colors');
          listItem.click(function() {
              $('#search-input').val(disease);
              searchDisease(disease.toLowerCase());
              $('#suggestions').empty();
          });
          $('#disease-list').append(listItem);
      });
  }

  $('#search-input').on('input', function() {
      const searchTerm = $(this).val().toLowerCase();
      const suggestions = data.filter(item => item.DOENCA.toLowerCase().includes(searchTerm));

      $('#suggestions').empty();
      suggestions.forEach(suggestion => {
          const suggestionItem = $('<div>').addClass('suggestion-item py-2 px-4 cursor-pointer hover:bg-gray-100 transition-colors').text(suggestion.DOENCA);
          suggestionItem.click(function() {
              $('#search-input').val(suggestion.DOENCA);
              $('#suggestions').empty();
              searchDisease(suggestion.DOENCA.toLowerCase());
          });
          $('#suggestions').append(suggestionItem);
      });
  });

  $('#search-input').on('blur', function() {
      setTimeout(() => $('#suggestions').empty(), 100);
  });

  function searchDisease(searchTerm) {
      const result = data.find(item => item.DOENCA.toLowerCase() === searchTerm);
      
      if (result) {
          $('#results').val(result.MEDICACAO);
          $('#results').off('input').on('input', function() {
              result.MEDICACAO = $(this).val();
              saveData();
          });
      } else {
          $('#results').val('Doença não encontrada.');
          $('#results').off('input');
      }
  }

  function saveData() {
      $.ajax({
          url: 'https://xvencedor.pythonanywhere.com/medicacoes',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(data),
          success: function(response) {
              console.log('Dados salvos com sucesso:', response);
          },
          error: function(error) {
              console.error('Erro ao salvar os dados:', error);
          }
      });
  }

  // Função para mostrar o popup
  function showPopup() {
      $('#popup-overlay').fadeIn();
  }

  // Função para esconder o popup
  function hidePopup() {
      $('#popup-overlay').fadeOut();
      $('#new-disease').val('');
      $('#new-medication').val('');
  }

  // Evento para mostrar o popup quando o botão é clicado
  $('#add-disease-btn').click(function() {
      showPopup();
  });

  // Evento para salvar a nova doença/medicação
  $('#save-btn').click(function() {
      const newDisease = $('#new-disease').val().trim();
      const newMedication = $('#new-medication').val().trim();

      if (newDisease && newMedication) {
          data.push({ DOENCA: newDisease, MEDICACAO: newMedication });
          saveData();
          populateDiseaseList();
          hidePopup();
      } else {
          alert('Por favor, preencha ambos os campos.');
      }
  });

  // Evento para cancelar a adição
  $('#cancel-btn').click(function() {
      hidePopup();
  });

  // Busca os dados quando a página carrega
  fetchData();
});
