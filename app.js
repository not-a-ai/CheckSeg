document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('cadastroForm');
    const clienteSelect = document.getElementById('clienteSelect');
    const formNovoCliente = document.getElementById('formNovoCliente');
    const listaClientesModal = document.getElementById('listaClientesModal');
    const estadoVazioClientes = document.getElementById('estadoVazioClientes');
    const tabelaClientes = document.getElementById('tabelaClientes');
    const estadoVazio = document.getElementById('estadoVazio');
    const tabelaContainer = document.querySelector('.table').parentElement;

    // Dashboard elements
    const countTodos = document.getElementById('countTodos');
    const countEmDia = document.getElementById('countEmDia');
    const countProximo = document.getElementById('countProximo');
    const countVencido = document.getElementById('countVencido');
    const btnDashboards = document.querySelectorAll('.btn-dashboard');
    const inputDataInstalacao = document.getElementById('dataInstalacao');

    let filtroAtual = 'todos';

    // Regras de negócio (Meses Úteis)
    const MESES_MANUTENCAO = {
        'Ar Condicionado': 6,
        'Compressor': 12,
        'Gerador': 12
    };

    // Configurando limites de data (10 anos para trás e 10 anos para frente)
    const hojeGlobal = new Date();
    const minDate = new Date(hojeGlobal);
    minDate.setFullYear(hojeGlobal.getFullYear() - 10);
    const maxDate = new Date(hojeGlobal);
    maxDate.setFullYear(hojeGlobal.getFullYear() + 10);

    const formatForInput = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    if (inputDataInstalacao) {
        inputDataInstalacao.min = formatForInput(minDate);
        inputDataInstalacao.max = formatForInput(maxDate);
    }

    // Inicializa a listagem ao carregar a página
    renderTabelaClientes();
    renderTabela();

    // Event listener para envio do formulário
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const clienteId = clienteSelect.value;
        const clientes = JSON.parse(localStorage.getItem('cadastrosClientes')) || [];
        const cliente = clientes.find(c => c.id === clienteId);

        const nomeCliente = cliente ? cliente.nome : '';
        const telefoneCliente = document.getElementById('telefoneCliente').value.trim();
        const tipoEquipamento = document.getElementById('tipoEquipamento').value;
        const dataInstalacao = document.getElementById('dataInstalacao').value;

        if (nomeCliente && telefoneCliente && tipoEquipamento && dataInstalacao) {
            // Validar limites da data
            const [anoStr, mesStr, diaStr] = dataInstalacao.split('-');
            const dataSelecionada = new Date(parseInt(anoStr), parseInt(mesStr) - 1, parseInt(diaStr));

            // Zerar hora para comparação justa
            const hojeTemp = new Date();
            hojeTemp.setHours(0, 0, 0, 0);

            const limitePassado = new Date(hojeTemp);
            limitePassado.setFullYear(hojeTemp.getFullYear() - 10);

            const limiteFuturo = new Date(hojeTemp);
            limiteFuturo.setFullYear(hojeTemp.getFullYear() + 10);

            if (dataSelecionada < limitePassado || dataSelecionada > limiteFuturo) {
                alert('A data de instalação deve estar entre 10 anos no passado e 10 anos no futuro.');
                return;
            }

            const novoCadastro = {
                id: Date.now().toString(),
                cliente: nomeCliente,
                telefone: telefoneCliente,
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

    // --- LÓGICA DE CLIENTES ---
    function renderTabelaClientes() {
        let clientes = JSON.parse(localStorage.getItem('cadastrosClientes')) || [];
        const selectedId = clienteSelect.value;

        clienteSelect.innerHTML = '<option value="" selected disabled>Selecione um cliente...</option>';
        listaClientesModal.innerHTML = '';

        if (clientes.length === 0) {
            estadoVazioClientes.style.display = 'block';
            listaClientesModal.parentElement.style.display = 'none';
        } else {
            estadoVazioClientes.style.display = 'none';
            listaClientesModal.parentElement.style.display = 'table';

            clientes.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = c.nome;
                clienteSelect.appendChild(opt);

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="fw-medium">${c.nome}</td>
                    <td>${c.telefone}</td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-danger" onclick="excluirCliente('${c.id}')">Excluir</button>
                    </td>
                `;
                listaClientesModal.appendChild(tr);
            });
        }

        if (selectedId && clientes.find(c => c.id === selectedId)) {
            clienteSelect.value = selectedId;
        }
    }

    if (clienteSelect) {
        clienteSelect.addEventListener('change', (e) => {
            const selectedId = e.target.value;
            const clientes = JSON.parse(localStorage.getItem('cadastrosClientes')) || [];
            const cliente = clientes.find(c => c.id === selectedId);
            if (cliente) {
                document.getElementById('telefoneCliente').value = cliente.telefone;
            } else {
                document.getElementById('telefoneCliente').value = '';
            }
        });
    }

    if (formNovoCliente) {
        formNovoCliente.addEventListener('submit', (e) => {
            e.preventDefault();
            const nomeStr = document.getElementById('novoNomeCliente').value.trim();
            const telStr = document.getElementById('novoTelefoneCliente').value.trim();
            if (nomeStr && telStr) {
                let clientes = JSON.parse(localStorage.getItem('cadastrosClientes')) || [];
                clientes.push({
                    id: Date.now().toString(),
                    nome: nomeStr,
                    telefone: telStr
                });
                localStorage.setItem('cadastrosClientes', JSON.stringify(clientes));
                formNovoCliente.reset();
                renderTabelaClientes();
            }
        });
    }

    window.excluirCliente = function (id) {
        if (confirm('Deseja excluir este cliente? Isso NÃO removerá os equipamentos já associados a ele.')) {
            let clientes = JSON.parse(localStorage.getItem('cadastrosClientes')) || [];
            clientes = clientes.filter(c => c.id !== id);
            localStorage.setItem('cadastrosClientes', JSON.stringify(clientes));
            renderTabelaClientes();

            if (clienteSelect.value === id) {
                clienteSelect.value = "";
                document.getElementById('telefoneCliente').value = "";
            }
        }
    };

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

    function gerarMensagemWhatsApp(cliente, equipamento) {
        const mensagens = {
            'Ar Condicionado': `Olá, ${cliente}! Tudo bem? Verificamos que está na hora de realizar a manutenção preventiva do seu Ar Condicionado. Vamos agendar uma visita técnica para garantir o bom funcionamento e a qualidade do ar?`,
            'Gerador': `Olá, ${cliente}! Tudo bem? A manutenção preventiva do seu Gerador está programada para este período. Manter a manutenção em dia é essencial para evitar imprevistos e garantir energia quando precisar. Podemos agendar?`,
            'Compressor': `Olá, ${cliente}! Tudo bem? Notamos que o seu Compressor precisa passar por manutenção preventiva. Vamos agendar o serviço para evitar paradas na produção e surpresas?`
        };

        const mensagemPadrao = `Olá, ${cliente}! Tudo bem? Gostaria de lembrar da manutenção preventiva do seu equipamento (${equipamento}). Vamos agendar?`;

        return mensagens[equipamento] || mensagemPadrao;
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
        if (countTodos) countTodos.textContent = stats.todos;
        if (countEmDia) countEmDia.textContent = stats['em-dia'];
        if (countProximo) countProximo.textContent = stats.proximo;
        if (countVencido) countVencido.textContent = stats.vencido;

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

                // Formatar número para o link do WhatsApp (remover não-números)
                const numeroLimpo = item.telefone ? item.telefone.replace(/\D/g, '') : '';
                const mensagem = gerarMensagemWhatsApp(item.cliente, item.equipamento);
                const linkWhatsApp = numeroLimpo ? `https://wa.me/55${numeroLimpo}?text=${encodeURIComponent(mensagem)}` : '#';
                const contatoHtml = item.telefone
                    ? `<a href="${linkWhatsApp}" target="_blank" class="text-decoration-none border rounded p-1 bg-light text-success fw-medium d-inline-block" style="font-size: 0.85rem;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-whatsapp" viewBox="0 0 16 16" style="margin-right:4px;">
  <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
</svg>${item.telefone}</a>`
                    : '<span class="text-muted small">N/A</span>';

                tr.innerHTML = `
                    <td class="fw-medium">${item.cliente}</td>
                    <td>${contatoHtml}</td>
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
    window.excluirCadastro = function (id) {
        if (confirm('Deseja realmente excluir este cadastro?')) {
            let cadastros = JSON.parse(localStorage.getItem('cadastrosManutencao')) || [];
            cadastros = cadastros.filter(c => c.id !== id);
            localStorage.setItem('cadastrosManutencao', JSON.stringify(cadastros));
            renderTabela();
        }
    };
});
