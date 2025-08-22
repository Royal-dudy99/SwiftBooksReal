// SwiftBooks Money Manager Application
class SwiftBooks {
    constructor() {
        this.data = {
            transactions: [],
            settings: {
                currency: 'INR',
                theme: 'light'
            }
        };
        
        this.exchangeRates = {
            'INR': 1,
            'USD': 0.012,
            'EUR': 0.011
        };
        
        this.currencySymbols = {
            'INR': '₹',
            'USD': '$',
            'EUR': '€'
        };
        
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.confirmCallback = null;
    }
    
    init() {
        this.loadData();
        this.loadSampleData();
        this.setupEventListeners();
        this.setCurrentDate();
        this.updateDashboard();
        this.updateTransactionsList();
        this.updateSettings();
    }
    
    loadData() {
        const savedData = localStorage.getItem('swiftbooks_data');
        if (savedData) {
            this.data = JSON.parse(savedData);
        }
        
        // Apply saved theme
        if (this.data.settings.theme === 'dark') {
            document.body.setAttribute('data-color-scheme', 'dark');
        }
    }
    
    saveData() {
        localStorage.setItem('swiftbooks_data', JSON.stringify(this.data));
    }
    
    loadSampleData() {
        if (this.data.transactions.length === 0) {
            const sampleTransactions = [
                {
                    id: 1,
                    type: 'expense',
                    amount: 250,
                    currency: 'INR',
                    category: 'food',
                    accountType: 'card',
                    note: 'Lunch at restaurant',
                    description: 'Team lunch',
                    date: '2025-08-22'
                },
                {
                    id: 2,
                    type: 'income',
                    amount: 50000,
                    currency: 'INR',
                    category: 'salary',
                    accountType: 'account',
                    note: 'Monthly salary',
                    description: 'August salary credit',
                    date: '2025-08-01'
                }
            ];
            
            this.data.transactions = sampleTransactions;
            this.saveData();
        }
    }
    
    setupEventListeners() {
        // Navigation buttons
        document.querySelectorAll('[data-section]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const sectionId = e.currentTarget.getAttribute('data-section');
                this.showSection(sectionId);
            });
        });
        
        // Modal trigger buttons
        document.querySelectorAll('[data-modal]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const modalId = e.currentTarget.getAttribute('data-modal');
                this.openModal(modalId);
            });
        });
        
        // Modal close buttons
        document.querySelectorAll('[data-close]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const modalId = e.currentTarget.getAttribute('data-close');
                this.closeModal(modalId);
            });
        });
        
        // Filter buttons
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const filterType = e.currentTarget.getAttribute('data-filter');
                this.filterByType(filterType);
            });
        });
        
        // Form submissions
        const forms = ['expense', 'income', 'transfer', 'loan', 'lend'];
        forms.forEach(formType => {
            const form = document.getElementById(`${formType}Form`);
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleFormSubmit(formType);
                });
            }
        });
        
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('keyup', () => {
                this.filterTransactions();
            });
        }
        
        // Settings
        const currencySelector = document.getElementById('currencySelector');
        if (currencySelector) {
            currencySelector.addEventListener('change', () => {
                this.updateCurrency();
            });
        }
        
        // Theme toggle
        const themeToggleBtn = document.getElementById('themeToggleBtn');
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTheme();
            });
        }
        
        // Data management
        const exportBtn = document.getElementById('exportDataBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.exportData();
            });
        }
        
        const clearBtn = document.getElementById('clearDataBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.confirmClearData();
            });
        }
        
        const confirmBtn = document.getElementById('confirmButton');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.executeConfirmAction();
            });
        }
        
        // Modal backdrop handling
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
            
            // Prevent modal content from closing modal
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            }
        });
    }
    
    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        document.querySelectorAll('input[type="date"]').forEach(input => {
            if (!input.value) {
                input.value = today;
            }
        });
    }
    
    generateId() {
        return Date.now() + Math.random();
    }
    
    showSection(sectionId) {
        console.log('Showing section:', sectionId); // Debug log
        
        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Find and activate the correct nav button
        document.querySelectorAll('[data-section]').forEach(btn => {
            if (btn.getAttribute('data-section') === sectionId) {
                btn.classList.add('active');
            }
        });
        
        // Update sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            
            // Update content based on section
            if (sectionId === 'analytics') {
                setTimeout(() => this.updateAnalytics(), 100);
            } else if (sectionId === 'transactions') {
                this.updateTransactionsList();
            }
        }
    }
    
    openModal(modalId) {
        console.log('Opening modal:', modalId); // Debug log
        
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            
            // Reset form if it exists
            const form = modal.querySelector('form');
            if (form) {
                form.reset();
                this.setCurrentDate();
            }
        }
    }
    
    closeModal(modalId) {
        console.log('Closing modal:', modalId); // Debug log
        
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    handleFormSubmit(formType) {
        const formData = this.getFormData(formType);
        if (this.validateTransaction(formData, formType)) {
            formData.id = this.generateId();
            formData.type = formType;
            this.data.transactions.push(formData);
            this.saveData();
            this.closeModal(`${formType}Modal`);
            this.showSuccess(`${formType.charAt(0).toUpperCase() + formType.slice(1)} added successfully!`);
            this.updateAll();
        }
    }
    
    getFormData(type) {
        const data = {
            amount: parseFloat(document.getElementById(`${type}Amount`).value),
            currency: document.getElementById(`${type}Currency`).value,
            date: document.getElementById(`${type}Date`).value,
            note: document.getElementById(`${type}Note`)?.value || '',
            description: document.getElementById(`${type}Description`)?.value || ''
        };
        
        // Type specific fields
        if (type === 'expense' || type === 'income') {
            data.category = document.getElementById(`${type}Category`).value;
            data.accountType = document.getElementById(`${type}AccountType`).value;
        } else if (type === 'transfer') {
            data.fromAccount = document.getElementById(`${type}FromAccount`).value;
            data.toAccount = document.getElementById(`${type}ToAccount`).value;
        } else if (type === 'loan') {
            data.interestRate = parseFloat(document.getElementById(`${type}InterestRate`).value) || 0;
            data.lenderName = document.getElementById(`${type}LenderName`).value;
            data.dueDate = document.getElementById(`${type}DueDate`)?.value || '';
        } else if (type === 'lend') {
            data.borrowerName = document.getElementById(`${type}BorrowerName`).value;
            data.returnDate = document.getElementById(`${type}ReturnDate`)?.value || '';
        }
        
        return data;
    }
    
    validateTransaction(data, type) {
        if (!data.amount || data.amount <= 0) {
            alert('Please enter a valid amount');
            return false;
        }
        
        if (!data.date) {
            alert('Please select a date');
            return false;
        }
        
        // Type-specific validation
        if ((type === 'expense' || type === 'income') && !data.category) {
            alert('Please select a category');
            return false;
        }
        
        if ((type === 'expense' || type === 'income') && !data.accountType) {
            alert('Please select an account type');
            return false;
        }
        
        if (type === 'transfer') {
            if (!data.fromAccount) {
                alert('Please select from account');
                return false;
            }
            if (!data.toAccount) {
                alert('Please select to account');
                return false;
            }
            if (data.fromAccount === data.toAccount) {
                alert('From and To accounts cannot be the same!');
                return false;
            }
        }
        
        if (type === 'loan' && !data.lenderName) {
            alert('Please enter lender name');
            return false;
        }
        
        if (type === 'lend' && !data.borrowerName) {
            alert('Please enter borrower name');
            return false;
        }
        
        return true;
    }
    
    updateDashboard() {
        const totals = this.calculateTotals();
        const currency = this.data.settings.currency;
        const symbol = this.currencySymbols[currency];
        
        document.getElementById('totalBalance').textContent = `${symbol}${this.formatAmount(totals.balance)}`;
        document.getElementById('totalIncome').textContent = `${symbol}${this.formatAmount(totals.income)}`;
        document.getElementById('totalExpenses').textContent = `${symbol}${this.formatAmount(totals.expenses)}`;
        
        this.updateRecentTransactions();
    }
    
    updateRecentTransactions() {
        const recentTransactions = this.data.transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
        
        const container = document.getElementById('recentTransactionsList');
        
        if (recentTransactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <h3>No transactions yet</h3>
                    <p>Start by adding your first transaction using the quick actions above.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = recentTransactions
            .map(transaction => this.renderTransactionItem(transaction))
            .join('');
    }
    
    calculateTotals() {
        const currency = this.data.settings.currency;
        let income = 0;
        let expenses = 0;
        
        this.data.transactions.forEach(transaction => {
            const amount = this.convertCurrency(transaction.amount, transaction.currency, currency);
            
            if (transaction.type === 'income') {
                income += amount;
            } else if (transaction.type === 'expense') {
                expenses += amount;
            }
        });
        
        return {
            income,
            expenses,
            balance: income - expenses
        };
    }
    
    convertCurrency(amount, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) return amount;
        
        // Convert to INR first, then to target currency
        const inINR = amount / this.exchangeRates[fromCurrency];
        return inINR * this.exchangeRates[toCurrency];
    }
    
    formatAmount(amount) {
        return new Intl.NumberFormat('en-IN').format(Math.abs(amount));
    }
    
    updateTransactionsList() {
        const container = document.getElementById('transactionsList');
        if (!container) return;
        
        let filteredTransactions = this.getFilteredTransactions();
        
        if (filteredTransactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No transactions found</h3>
                    <p>Try adjusting your search or filter criteria.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = filteredTransactions
            .map(transaction => this.renderTransactionItem(transaction, true))
            .join('');
    }
    
    getFilteredTransactions() {
        let transactions = [...this.data.transactions];
        
        // Filter by type
        if (this.currentFilter !== 'all') {
            transactions = transactions.filter(t => t.type === this.currentFilter);
        }
        
        // Filter by search term
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            transactions = transactions.filter(t => 
                (t.note && t.note.toLowerCase().includes(term)) ||
                (t.description && t.description.toLowerCase().includes(term)) ||
                (t.category && t.category.toLowerCase().includes(term)) ||
                (t.lenderName && t.lenderName.toLowerCase().includes(term)) ||
                (t.borrowerName && t.borrowerName.toLowerCase().includes(term))
            );
        }
        
        // Sort by date (newest first)
        return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    
    renderTransactionItem(transaction, showActions = false) {
        const currency = this.data.settings.currency;
        const convertedAmount = this.convertCurrency(transaction.amount, transaction.currency, currency);
        const symbol = this.currencySymbols[currency];
        const isNegative = transaction.type === 'expense' || transaction.type === 'lend';
        
        const iconMap = {
            expense: 'fas fa-minus',
            income: 'fas fa-plus',
            transfer: 'fas fa-exchange-alt',
            loan: 'fas fa-hand-holding-usd',
            lend: 'fas fa-handshake'
        };
        
        const titleMap = {
            expense: transaction.category ? transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1) : 'Expense',
            income: transaction.category ? transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1) : 'Income',
            transfer: `Transfer: ${transaction.fromAccount} → ${transaction.toAccount}`,
            loan: `Loan from ${transaction.lenderName}`,
            lend: `Lent to ${transaction.borrowerName}`
        };
        
        const actionsHtml = showActions ? `
            <div class="transaction-actions">
                <button class="action-icon-btn" onclick="window.appInstance.deleteTransaction(${transaction.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        ` : '';
        
        return `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-icon ${transaction.type}">
                        <i class="${iconMap[transaction.type]}"></i>
                    </div>
                    <div class="transaction-details">
                        <h4>${titleMap[transaction.type]}</h4>
                        <div class="transaction-meta">
                            ${transaction.note || transaction.description || 'No description'}
                        </div>
                    </div>
                </div>
                <div class="transaction-amount">
                    <div class="amount ${transaction.type}">
                        ${isNegative ? '-' : '+'}${symbol}${this.formatAmount(convertedAmount)}
                    </div>
                    <div class="transaction-date">
                        ${new Date(transaction.date).toLocaleDateString()}
                    </div>
                </div>
                ${actionsHtml}
            </div>
        `;
    }
    
    filterByType(type) {
        console.log('Filtering by type:', type); // Debug log
        
        this.currentFilter = type;
        
        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-filter') === type) {
                btn.classList.add('active');
            }
        });
        
        this.updateTransactionsList();
    }
    
    filterTransactions() {
        const searchInput = document.getElementById('searchInput');
        this.searchTerm = searchInput ? searchInput.value : '';
        this.updateTransactionsList();
    }
    
    deleteTransaction(id) {
        this.showConfirmDialog(
            'Delete Transaction',
            'Are you sure you want to delete this transaction? This action cannot be undone.',
            () => {
                this.data.transactions = this.data.transactions.filter(t => t.id !== id);
                this.saveData();
                this.showSuccess('Transaction deleted successfully!');
                this.updateAll();
            }
        );
    }
    
    updateAnalytics() {
        this.updateExpenseCategoryChart();
        this.updateIncomeExpenseChart();
        this.updateCategoryBreakdown();
        this.updateMonthlyTrendsChart();
    }
    
    updateExpenseCategoryChart() {
        const ctx = document.getElementById('expenseCategoryChart');
        if (!ctx) return;
        
        const expenses = this.data.transactions.filter(t => t.type === 'expense');
        const categoryTotals = {};
        
        expenses.forEach(expense => {
            const category = expense.category || 'other';
            const amount = this.convertCurrency(expense.amount, expense.currency, this.data.settings.currency);
            categoryTotals[category] = (categoryTotals[category] || 0) + amount;
        });
        
        const labels = Object.keys(categoryTotals);
        const data = Object.values(categoryTotals);
        const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B'];
        
        if (this.expenseCategoryChart) {
            this.expenseCategoryChart.destroy();
        }
        
        if (labels.length === 0) {
            ctx.parentElement.innerHTML = '<h3>Expenses by Category</h3><p>No expense data available for chart</p>';
            return;
        }
        
        this.expenseCategoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    updateIncomeExpenseChart() {
        const ctx = document.getElementById('incomeExpenseChart');
        if (!ctx) return;
        
        const totals = this.calculateTotals();
        
        if (this.incomeExpenseChart) {
            this.incomeExpenseChart.destroy();
        }
        
        this.incomeExpenseChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Income', 'Expenses'],
                datasets: [{
                    data: [totals.income, totals.expenses],
                    backgroundColor: ['#1FB8CD', '#B4413C'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => this.currencySymbols[this.data.settings.currency] + this.formatAmount(value)
                        }
                    }
                }
            }
        });
    }
    
    updateCategoryBreakdown() {
        const container = document.getElementById('categoryBreakdown');
        if (!container) return;
        
        const expenses = this.data.transactions.filter(t => t.type === 'expense');
        const categoryTotals = {};
        let totalExpenses = 0;
        
        expenses.forEach(expense => {
            const category = expense.category || 'other';
            const amount = this.convertCurrency(expense.amount, expense.currency, this.data.settings.currency);
            categoryTotals[category] = (categoryTotals[category] || 0) + amount;
            totalExpenses += amount;
        });
        
        const sortedCategories = Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1]);
        
        if (sortedCategories.length === 0) {
            container.innerHTML = '<p>No expense data available</p>';
            return;
        }
        
        const symbol = this.currencySymbols[this.data.settings.currency];
        
        container.innerHTML = sortedCategories.map(([category, amount]) => {
            const percentage = ((amount / totalExpenses) * 100).toFixed(1);
            return `
                <div class="category-item">
                    <div class="category-name">${category.charAt(0).toUpperCase() + category.slice(1)}</div>
                    <div class="category-stats">
                        <div class="category-amount">${symbol}${this.formatAmount(amount)}</div>
                        <div class="category-percentage">${percentage}%</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    updateMonthlyTrendsChart() {
        const ctx = document.getElementById('monthlyTrendsChart');
        if (!ctx) return;
        
        const monthlyData = {};
        
        this.data.transactions.forEach(transaction => {
            const date = new Date(transaction.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { income: 0, expenses: 0 };
            }
            
            const amount = this.convertCurrency(transaction.amount, transaction.currency, this.data.settings.currency);
            
            if (transaction.type === 'income') {
                monthlyData[monthKey].income += amount;
            } else if (transaction.type === 'expense') {
                monthlyData[monthKey].expenses += amount;
            }
        });
        
        const sortedMonths = Object.keys(monthlyData).sort();
        const incomeData = sortedMonths.map(month => monthlyData[month].income);
        const expenseData = sortedMonths.map(month => monthlyData[month].expenses);
        
        if (this.monthlyTrendsChart) {
            this.monthlyTrendsChart.destroy();
        }
        
        if (sortedMonths.length === 0) {
            ctx.parentElement.innerHTML = '<h3>Monthly Trends</h3><p>No transaction data available for trends</p>';
            return;
        }
        
        this.monthlyTrendsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: sortedMonths.map(month => {
                    const [year, monthNum] = month.split('-');
                    return new Date(year, monthNum - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                }),
                datasets: [
                    {
                        label: 'Income',
                        data: incomeData,
                        borderColor: '#1FB8CD',
                        backgroundColor: 'rgba(31, 184, 205, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Expenses',
                        data: expenseData,
                        borderColor: '#B4413C',
                        backgroundColor: 'rgba(180, 65, 60, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => this.currencySymbols[this.data.settings.currency] + this.formatAmount(value)
                        }
                    }
                }
            }
        });
    }
    
    updateSettings() {
        const currencySelector = document.getElementById('currencySelector');
        if (currencySelector) {
            currencySelector.value = this.data.settings.currency;
        }
        
        const themeText = document.getElementById('themeText');
        if (themeText) {
            if (this.data.settings.theme === 'dark') {
                themeText.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
            } else {
                themeText.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
            }
        }
    }
    
    updateCurrency() {
        const currencySelector = document.getElementById('currencySelector');
        if (currencySelector) {
            const newCurrency = currencySelector.value;
            this.data.settings.currency = newCurrency;
            this.saveData();
            this.updateAll();
            this.showSuccess('Currency updated successfully!');
        }
    }
    
    toggleTheme() {
        this.data.settings.theme = this.data.settings.theme === 'light' ? 'dark' : 'light';
        
        if (this.data.settings.theme === 'dark') {
            document.body.setAttribute('data-color-scheme', 'dark');
        } else {
            document.body.removeAttribute('data-color-scheme');
        }
        
        this.saveData();
        this.updateSettings();
        this.showSuccess('Theme updated successfully!');
    }
    
    exportData() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `swiftbooks-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showSuccess('Data exported successfully!');
    }
    
    confirmClearData() {
        this.showConfirmDialog(
            'Clear All Data',
            'Are you sure you want to clear all data? This action cannot be undone and will remove all your transactions and settings.',
            () => {
                this.data = {
                    transactions: [],
                    settings: {
                        currency: 'INR',
                        theme: 'light'
                    }
                };
                this.saveData();
                document.body.removeAttribute('data-color-scheme');
                this.updateAll();
                this.updateSettings();
                this.showSuccess('All data cleared successfully!');
            }
        );
    }
    
    updateAll() {
        this.updateDashboard();
        this.updateTransactionsList();
        setTimeout(() => this.updateAnalytics(), 100);
    }
    
    showSuccess(message) {
        const successEl = document.getElementById('successMessage');
        const textEl = document.getElementById('successText');
        
        if (successEl && textEl) {
            textEl.textContent = message;
            successEl.classList.remove('hidden');
            successEl.classList.add('show');
            
            setTimeout(() => {
                successEl.classList.remove('show');
                setTimeout(() => {
                    successEl.classList.add('hidden');
                }, 300);
            }, 3000);
        }
    }
    
    showConfirmDialog(title, message, callback) {
        const titleEl = document.getElementById('confirmTitle');
        const messageEl = document.getElementById('confirmMessage');
        
        if (titleEl && messageEl) {
            titleEl.textContent = title;
            messageEl.textContent = message;
            this.confirmCallback = callback;
            this.openModal('confirmModal');
        }
    }
    
    executeConfirmAction() {
        if (this.confirmCallback) {
            this.confirmCallback();
            this.confirmCallback = null;
        }
        this.closeModal('confirmModal');
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.appInstance = new SwiftBooks();
    window.appInstance.init();
});