
const seatMap = document.getElementById('seat-map');


function createSeat(id, ocupado) {
    const seatElement = document.createElement('div');
    seatElement.className = 'seat';
    seatElement.innerText = id;
    seatElement.setAttribute('data-ocupado', ocupado ? '1' : '0'); // Adiciona o atributo ocupado

    
    seatElement.addEventListener('click', () => {
      if (!seatElement.classList.contains('ocupado')) { // Verifica se o assento não está ocupado
          seatElement.classList.toggle('selected');

          // Adiciona ou remove o assento da lista de assentos selecionados
          const seatIndex = selectedSeats.indexOf(id);
          if (seatElement.classList.contains('selected') && seatIndex === -1) {
              selectedSeats.push(id);
          } else if (!seatElement.classList.contains('selected') && seatIndex !== -1) {
              selectedSeats.splice(seatIndex, 1);
          }

          // Exibe os assentos selecionados no console (pode ser removido ou substituído por sua lógica)
          console.log('Assentos selecionados:', selectedSeats);
      }
  });

  // Define a cor vermelha para assentos ocupados
  if (ocupado) {
      seatElement.classList.add('ocupado');
  }

  return seatElement;
}

function createCorridor() {
    const corridorElement = document.createElement('div');
    corridorElement.className = 'corridor';
    return corridorElement;
}

function initSeatMap(totalSeatsFromDatabase, seatsPerRowFromDatabase, seatsBeforeCorridorFromDatabase, seatsOcupadosFromDatabase ) {
    const seatsPerRow = seatsPerRowFromDatabase || 1; // Padrão para 1 assento por linha se não houver valor no banco de dados
    const seatsBeforeCorridor = seatsBeforeCorridorFromDatabase || 0; // Padrão para nenhum assento antes do corredor

    for (let i = 1; i <= totalSeatsFromDatabase; i++) {
        const ocupado = seatsOcupadosFromDatabase && seatsOcupadosFromDatabase.includes(i);
        const seatElement = createSeat(i, ocupado);
        seatMap.appendChild(seatElement);

        if (i % seatsPerRow === seatsBeforeCorridor) {
            const corridorElement = createCorridor();
            seatMap.appendChild(corridorElement);
        }
    }

    // Ajusta o grid-template-columns para garantir o número correto de assentos por linha
    seatMap.style.gridTemplateColumns = `repeat(${seatsPerRow + 1}, 1fr)`; // +1 para acomodar o corredor
}

