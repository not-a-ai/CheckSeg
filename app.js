document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('cadastroForm');
    const tabelaClientes = document.getElementById('tabelaClientes');
    const estadoVazio = document.getElementById('estadoVazio');
    const tabelaContainer = document.querySelector('.table').parentElement;
    
    // Dashboard elements
    const countTodos = document.getElementById('countTodos');
    const countEmDia = document.getElementById('countEmDia');
    const countProximo = document.getElementById('countProximo');
    const countVencido = document.getElementById('countVencido');
    const btnDashboards = document.querySelectorAll('.btn-dashboard');

    let filtroAtual = 'todos';

    // Regras de negócio (Meses Úteis)
    const MESES_MANUTENCAO = {
        'Ar Condicionado': 6,
        'Compressor': 12,
        'Gerador': 12
    };

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

    // Event listeners para filtros do dashboard
    btnDashboards.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active de todos
            btnDashboards.forEach(b => b.classList.remove('active'));
            // Add active no clicado
            btn.classList.add('active');
            
            filtroAtual = btn.dataset.filter;
            renderTabela();
        });
    });

    function salvarNoLocalStorage(cadastro) {
        let cadastrosExistentes = JSON.parse(localStorage.getItem('cadastrosManutencao')) || [];
        cadastrosExistentes.push(cadastro);
        localStorage.setItem('cadastrosManutencao', JSON.stringify(cadastrosExistentes));
    }

    function calcularVencimento(dataInstalacaoStr, tipoEquipamento) {
        const dataStr = dataInstalacaoStr;
        // Se a string for yyyy-mm-dd, ajustamos para pegar meia-noite local para evitar bugs de fuso horário
        const [ano, mes, dia] = dataStr.split('-');
        const dataInstalacao = new Date(ano, mes - 1, dia);
        
        const mesesAdicionais = MESES_MANUTENCAO[tipoEquipamento] || 6;
        const dataVencimento = new Date(dataInstalacao);
        dataVencimento.setMonth(dataVencimento.getMonth() + mesesAdicionais);
        
        return dataVencimento;
    }

    function verificarStatus(dataVencimento) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0); // Zera hora para comparar apenas datas

        // Diferença em dias
        const diffTempo = dataVencimento.getTime() - hoje.getTime();
        const diffDias = Math.ceil(diffTempo / (1000 * 60 * 60 * 24));

        if (diffDias < 0) {
            return { id: 'vencido', label: 'Vencido', classe: 'vencido' };
        } else if (diffDias <= 30) {
            return { id: 'proximo', label: 'Próximo', classe: 'proximo' };
        } else {
            return { id: 'em-dia', label: 'Em dia', classe: 'em-dia' };
        }
    }

    function formatarDataBR(dataDate) {
        const dia = String(dataDate.getDate()).padStart(2, '0');
        const mes = String(dataDate.getMonth() + 1).padStart(2, '0');
        const ano = dataDate.getFullYear();
        return `${dia}/${mes}/${ano}`;
    }

    function formatarDataISO(dataISO) {
        const [ano, mes, dia] = dataISO.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    function renderTabela() {
        const cadastros = JSON.parse(localStorage.getItem('cadastrosManutencao')) || [];
        
        // Objeto para guardar as contagens do dashboard
        let stats = {
            todos: cadastros.length,
            'em-dia': 0,
            proximo: 0,
            vencido: 0
        };

        // Pre-processa cadastros para adicionar informações de status
        const cadastrosProcessados = cadastros.map(item => {
            const dataVencimento = calcularVencimento(item.dataInstalacao, item.equipamento);
            const status = verificarStatus(dataVencimento);
            
            stats[status.id]++;
            
            return {
                ...item,
                dataVencimentoFormatada: formatarDataBR(dataVencimento),
                status: status
            };
        });

        // Atualiza Dashboard na tela
        if(countTodos) countTodos.textContent = stats.todos;
        if(countEmDia) countEmDia.textContent = stats['em-dia'];
        if(countProximo) countProximo.textContent = stats.proximo;
        if(countVencido) countVencido.textContent = stats.vencido;

        // Filtra para a tabela atual baseada no card clicado
        const cadastrosFiltrados = filtroAtual === 'todos' 
            ? cadastrosProcessados 
            : cadastrosProcessados.filter(c => c.status.id === filtroAtual);

        tabelaClientes.innerHTML = '';

        if (cadastrosFiltrados.length === 0) {
            estadoVazio.style.display = 'block';
            tabelaContainer.style.display = 'none';
        } else {
            estadoVazio.style.display = 'none';
            tabelaContainer.style.display = 'block';

            cadastrosFiltrados.forEach(item => {
                const tr = document.createElement('tr');
                tr.className = `tr-enter tr-status ${item.status.classe}`;
                tr.innerHTML = `
                    <td class="fw-medium">${item.cliente}</td>
                    <td><span class="badge bg-light text-dark border">${item.equipamento}</span></td>
                    <td>${formatarDataISO(item.dataInstalacao)}</td>
                    <td class="fw-medium">${item.dataVencimentoFormatada}</td>
                    <td><span class="status-badge ${item.status.classe}">${item.status.label}</span></td>
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
