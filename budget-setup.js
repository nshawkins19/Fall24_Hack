localStorage.clear();
// Budget setup functionality
let categoryBudgets = {};

function showBudgetSetup() {
    const modal = document.getElementById('budgetSetupModal');
    if (modal) {
        modal.classList.remove('hidden');
    } else {
        console.error('Budget setup modal not found');
    }
}

function hideBudgetSetup() {
    const modal = document.getElementById('budgetSetupModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function saveBudgets() {
    const inputs = document.querySelectorAll('#budgetInputsContainer input');
    const budgets = {};
    let isValid = true;

    inputs.forEach(input => {
        const value = parseFloat(input.value);
        if (isNaN(value) || value < 0) {
            isValid = false;
            return;
        }
        budgets[input.dataset.category] = value;
    });

    if (!isValid) {
        alert('Please enter valid amounts for all categories');
        return;
    }

    // Save budgets to localStorage
    localStorage.setItem('categoryBudgets', JSON.stringify(budgets));
    
    // Dispatch event to notify other scripts
    window.dispatchEvent(new Event('budgetsSaved'));
    
    // Hide modal
    hideBudgetSetup();
}

// Initialize budget setup
document.addEventListener('DOMContentLoaded', () => {
    console.log('Budget setup script loaded');
    const savedBudgets = localStorage.getItem('categoryBudgets');
    
    if (savedBudgets) {
        categoryBudgets = JSON.parse(savedBudgets);
        console.log('Loaded saved budgets:', categoryBudgets);
    } else {
        console.log('No saved budgets found, showing setup modal');
        showBudgetSetup();
    }

    // Set up event listener for the start tracking button
    const startTrackingBtn = document.getElementById('startTrackingBtn');
    if (startTrackingBtn) {
        startTrackingBtn.addEventListener('click', saveBudgets);
    } else {
        console.error('Start tracking button not found');
    }

    // Initialize input values if budgets exist
    if (savedBudgets) {
        const inputs = document.querySelectorAll('#budgetInputsContainer input');
        inputs.forEach(input => {
            const savedValue = categoryBudgets[input.dataset.category];
            if (savedValue !== undefined) {
                input.value = savedValue;
            }
        });
    }
});

// Make categoryBudgets available globally
window.categoryBudgets = categoryBudgets;