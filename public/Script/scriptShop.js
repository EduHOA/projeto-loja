function processExcel() {
    const fileInput = document.getElementById('upload');
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Obtém a primeira planilha
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Converte a planilha em JSON
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Filtra e processa os dados de acordo com as regras solicitadas
        const processedData = processData(json);

        // Cria um novo arquivo Excel com os dados processados
        const newSheet = XLSX.utils.aoa_to_sheet(processedData);
        const newWorkbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(newWorkbook, newSheet, 'ProcessedData');

        // Gera o arquivo para download
        const wbout = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const link = document.getElementById('downloadLink');
        link.href = url;
        link.download = 'processed_file.xlsx';
        link.style.display = 'block';
        link.innerText = 'Download Processed File';
    };

    reader.readAsArrayBuffer(file);
}

function processData(data) {
    // Os dados começam a partir da linha 6 (índice 5)
    const filteredData = [];
    const headers = data[0]; // Verifique se o cabeçalho correto é realmente a linha 6

    // Índices das colunas relevantes
    const titleIndex = headers.indexOf('Nome do Produto');
    const statusIndex = headers.indexOf('Status do pedido');
    const unitsIndex = headers.indexOf('Quantidades');
    const revenueIndex = headers.indexOf('Subtotal do produto');
    const shippingIndex = headers.indexOf('Taxa de comissão');
    const totalIndex = headers.indexOf('Taxa de serviço'); // Novo índice para a coluna "Total (BRL)"

    // Adiciona o cabeçalho ao resultado, incluindo a nova coluna "Total Taxas"
    filteredData.push(['Título do anúncio', 'Status', 'Unidades', 'Subtotal do produto', 'Taxa de comissão', 'Taxa de serviço', 'Total Taxas']);

    // Processa as linhas de dados
    for (let i = 6; i < data.length; i++) {
        const row = data[i];

        // Ignora linhas com status indesejados
        const status = row[statusIndex]?.toLowerCase();
        if (status && (status.includes('cancelado automaticamente pelo sistema da Shopee, motivo : pedido não pago') ||
                       status.includes('cancelado pelo comprador, motivo : é necessário alterar o endereço de entrega') ||
                       status.includes('cancelado pelo comprador, motivo : achei mais barato em outro lugar') ||
                       status.includes('cancelado pelo comprador, motivo : modificar pedido existente') ||
                       status.includes('cancelado pelo comprador, motivo : é necessário inserir/alterar o código do cupom') ||
                       status.includes('cancelado pelo comprador, motivo : não quero mais comprar') ||
                       status.includes('cancelado') ||
                       status.includes('cancelado automaticamente pelo sistema da Shopee, motivo : entrega mal sucedida'))) {
            continue; // Esta linha é excluída
        }

        // Verifica se a Receita por produtos (BRL) é maior ou igual a 79
        const receita = parseFloat(row[revenueIndex]) || 0;
        const tarifasEnvio = receita >= 79 ? row[shippingIndex] : '';

        // Soma "Taxa de comissão" e "Taxa de serviço"
        const taxaComissao = parseFloat(row[shippingIndex]) || 0;
        const taxaServico = parseFloat(row[totalIndex]) || 0;
        const totalTaxas = taxaComissao + taxaServico;

        // Adiciona a linha filtrada com as colunas relevantes, incluindo "Total (BRL)"
        filteredData.push([
            row[titleIndex],
            row[statusIndex],
            row[unitsIndex],
            row[revenueIndex],
            totalTaxas // Nova coluna para a soma das taxas
        ]);
    }

    return filteredData;
}

function showFileName() {
    const fileInput = document.getElementById('upload');
    const fileLabel = document.getElementById('fileLabel');
    const uploadMessage = document.getElementById('uploadMessage');

    if (fileInput.files.length > 0) {
        fileLabel.textContent = fileInput.files[0].name;
        uploadMessage.style.display = 'block';
    }
}