const SUPABASE_URL = 'https://qgkzynwvdvbdlfevsjoq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFna3p5bnd2ZHZiZGxmZXZzam9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwMTExMzMsImV4cCI6MjA1NTU4NzEzM30.y-EUbalOduEX4AkM0ZMZQ8aEVhWpn4j3PPoEcqXfQjU';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Funções para manipular dados
async function getProfissionais() {
    const { data, error } = await supabase.from('profissionais').select('*');
    return data || [];
}

async function getAgendamentos() {
    const { data, error } = await supabase.from('agendamentos').select('*');
    return data || [];
}

async function addAgendamento(agendamento) {
    const { data, error } = await supabase.from('agendamentos').insert([agendamento]);
    return data;
}

async function addProfissional(profissional) {
    const { data, error } = await supabase.from('profissionais').insert([profissional]);
    return data;
}

async function deleteProfissional(id) {
    const { data, error } = await supabase.from('profissionais').delete().eq('id', id);
    return data;
}

async function deleteAgendamento(id) {
    const { data, error } = await supabase.from('agendamentos').delete().eq('id', id);
    return data;
}

// Atualizar valor total ao selecionar um serviço
document.getElementById('servico').addEventListener('change', function() {
    const servico = this.value;
    const valor = servico.split(' - ')[1]; // Extrai o valor do serviço
    document.getElementById('total').textContent = valor;
});

// Login
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === 'admin' && password === 'admin123') {
        showAdminScreen();
    } else if (username === 'user' && password === 'user123') {
        showUserScreen();
    } else {
        alert('Usuário ou senha incorretos.');
    }
});

// Logout
function logout() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('userScreen').classList.add('hidden');
    document.getElementById('adminScreen').classList.add('hidden');
}

// Mostrar tela do usuário
async function showUserScreen() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('userScreen').classList.remove('hidden');
    await loadProfissionais();
    await loadUserAgendamentos();
}

// Mostrar tela do admin
async function showAdminScreen() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('adminScreen').classList.remove('hidden');
    await loadProfissionais();
    await loadAdminAgendamentos();
}

// Carregar profissionais no select
async function loadProfissionais() {
    const select = document.getElementById('profissional');
    select.innerHTML = '';
    const profissionais = await getProfissionais();
    profissionais.forEach(prof => {
        const option = document.createElement('option');
        option.value = prof.id;
        option.textContent = prof.nome;
        select.appendChild(option);
    });

    const tbody = document.querySelector('#profissionaisTable tbody');
    tbody.innerHTML = '';
    profissionais.forEach(prof => {
        const row = `<tr>
            <td>${prof.nome}</td>
            <td class="actions">
                <button onclick="deleteProfissional('${prof.id}')">Excluir</button>
            </td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

// Carregar agendamentos do usuário
async function loadUserAgendamentos() {
    const tbody = document.querySelector('#userAgendamentosTable tbody');
    tbody.innerHTML = '';
    const agendamentos = await getAgendamentos();
    const userAgendamentos = agendamentos.filter(a => a.cliente === 'user');
    const profissionais = await getProfissionais();

    userAgendamentos.forEach(agendamento => {
        const profissional = profissionais.find(p => p.id === agendamento.profissional);
        const row = `<tr>
            <td>${agendamento.cliente}</td>
            <td>${new Date(agendamento.horario).toLocaleString()}</td>
            <td>${profissional ? profissional.nome : 'N/A'}</td>
            <td>${agendamento.servico}</td>
            <td>${agendamento.valor}</td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

// Carregar agendamentos do admin
async function loadAdminAgendamentos() {
    const tbody = document.querySelector('#adminAgendamentosTable tbody');
    tbody.innerHTML = '';
    const agendamentos = await getAgendamentos();
    const profissionais = await getProfissionais();

    agendamentos.forEach(agendamento => {
        const profissional = profissionais.find(p => p.id === agendamento.profissional);
        const row = `<tr>
            <td>${agendamento.cliente}</td>
            <td>${new Date(agendamento.horario).toLocaleString()}</td>
            <td>${profissional ? profissional.nome : 'N/A'}</td>
            <td>${agendamento.servico}</td>
            <td>${agendamento.valor}</td>
            <td class="actions">
                <button onclick="deleteAgendamento('${agendamento.id}')">Excluir</button>
            </td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

// Adicionar agendamento
document.getElementById('agendamentoForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const cliente = document.getElementById('cliente').value;
    const horario = document.getElementById('horario').value;
    const profissional = document.getElementById('profissional').value;
    const servico = document.getElementById('servico').value;
    const valor = servico.split(' - ')[1]; // Extrai o valor do serviço

    const agendamento = {
        cliente,
        horario,
        profissional,
        servico,
        valor
    };

    await addAgendamento(agendamento);
    alert('Agendamento realizado com sucesso!');
    await loadUserAgendamentos();
});

// Adicionar profissional
document.getElementById('profissionalForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const nome = document.getElementById('profissionalNome').value;

    const profissional = { nome };
    await addProfissional(profissional);
    alert('Profissional adicionado com sucesso!');
    await loadProfissionais();
});

// Excluir profissional
async function deleteProfissional(id) {
    await deleteProfissional(id);
    await loadProfissionais();
}

// Excluir agendamento
async function deleteAgendamento(id) {
    await deleteAgendamento(id);
    await loadAdminAgendamentos();
}
