document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('cadastroForm');
    const tabelaClientes = document.getElementById('tabelaClientes');
    const estadoVazio = document.getElementById('estadoVazio');
    const totalCadastros = document.getElementById('totalCadastros');
    const tabelaContainer = document.querySelector('.table').parentElement;

    // Inicializa a listagem ao carregar a página
    renderTabela();

    // Event listener para envio do formulário
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nomeCliente = document.getElementById('nomeCliente').value.trim();
        const tipoEquipamento = document.getElementById('tipoEquipamento').value;
        const dataInstalacao = document.getElementById('dataInstalacao').value;

        if (nomeCliente && tipoEquipamento && dataInstalacao) {
            const novoCadastro = {
                id: Date.now().toString(),
                cliente: nomeCliente,
                equipamento: tipoEquipamento,
                dataInstalacao: dataInstalacao,
                dataCadastro: new Date().toISOString()
            };

            salvarNoLocalStorage(novoCadastro);
            form.reset();
            renderTabela();
            alert('Cadastro salvo com sucesso!');
        }
    });

    function salvarNoLocalStorage(cadastro) {
        let cadastrosExistentes = JSON.parse(localStorage.getItem('cadastrosManutencao')) || [];
        cadastrosExistentes.push(cadastro);
        localStorage.setItem('cadastrosManutencao', JSON.stringify(cadastrosExistentes));
    }

    function formatarDataBR(dataISO) {
        const [ano, mes, dia] = dataISO.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    function renderTabela() {
        const cadastros = JSON.parse(localStorage.getItem('cadastrosManutencao')) || [];
        
        tabelaClientes.innerHTML = '';
        totalCadastros.textContent = cadastros.length;

        if (cadastros.length === 0) {
            estadoVazio.style.display = 'block';
            tabelaContainer.style.display = 'none';
        } else {
            estadoVazio.style.display = 'none';
            tabelaContainer.style.display = 'block';

            cadastros.forEach(item => {
                const tr = document.createElement('tr');
                tr.className = 'tr-enter';
                tr.innerHTML = `
                    <td class="fw-medium">${item.cliente}</td>
                    <td><span class="badge bg-light text-dark border">${item.equipamento}</span></td>
                    <td>${formatarDataBR(item.dataInstalacao)}</td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-danger" onclick="excluirCadastro('${item.id}')">
                            Excluir
                        </button>
                    </td>
                `;
                tabelaClientes.appendChild(tr);
            });
        }
    }

    // Função global para excluir cadastro
    window.excluirCadastro = function(id) {
        if(confirm('Deseja realmente excluir este cadastro?')) {
            let cadastros = JSON.parse(localStorage.getItem('cadastrosManutencao')) || [];
            cadastros = cadastros.filter(c => c.id !== id);
            localStorage.setItem('cadastrosManutencao', JSON.stringify(cadastros));
            renderTabela();
        }
    };
});
