var budgetController = (function() {
    var budgetCtrl = {};
    var item;

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
    };

    budgetCtrl.createItem = function(type, description, value) {
        var id;
        if (data.allItems[type].length > 0) {
            id = data.allItems[type][data.allItems[type].length - 1].id + 1;
        } else {
            id = 0;
        }

        if (type === "exp") {
            item = new Expense(id, description, value);
        } else {
            item = new Income(id, description, value);
        }
        data.allItems[type].push(item);

        return item;
    };

    budgetCtrl.calculateBudget = function() {
        calculateTotal("inc");
        calculateTotal("exp");
        data.budget = data.totals.inc - data.totals.exp;
        if (data.budget > 0) {
            data.percentage = Math.round(
                data.totals.exp / data.totals.inc * 100
            );
        } else {
            data.percentage = -1;
        }
    };

    var calculateTotal = function(type) {
        var total = 0;
        data.allItems[type].forEach(function(item) {
            total += item.value;
        });
        data.totals[type] = total;
    };

    budgetCtrl.getBudget = function() {
        return {
            budget: data.budget,
            percentage: data.percentage,
            totalInc: data.totals.inc,
            totalExp: data.totals.exp
        };
    };

    budgetCtrl.deleteItem = function(type, id) {
        var ids = data.allItems[type].map(function(item) {
            return item.id;
        });
        var index = ids.indexOf(id);
        if (index !== -1) {
            data.allItems[type].splice(index, 1);
        }
    };

    return budgetCtrl;
})();

var UiController = (function() {
    var UiCtrl = {};

    var DomStrings = {
        type: ".add__type",
        description: ".add__description",
        value: ".add__value",
        addButton: ".add__btn",
        incomeList: ".income__list",
        expenseList: ".expenses__list",
        budgetValue: ".budget__value",
        budgetIncome: ".budget__income",
        budgetExpenses: ".budget__expenses",
        deleteButton: ".container"
    };

    UiCtrl.getDomStrings = function() {
        return DomStrings;
    };

    UiCtrl.getInput = function() {
        return {
            type: document.querySelector(DomStrings.type).value,
            description: document.querySelector(DomStrings.description).value,
            value: parseFloat(document.querySelector(DomStrings.value).value)
        };
    };

    UiCtrl.clearInput = function() {
        document.querySelector(DomStrings.description).value = "";
        document.querySelector(DomStrings.value).value = "";
    };

    UiCtrl.addItemToList = function(type, item) {
        var listHtml, newListHtml, selector;
        if (type === "inc") {
            listHtml =
                '<div class="item clearfix" id="inc-%id%">' +
                '<div class="item__description">%description%</div>' +
                '<div class="right clearfix"><div class="item__value">%value%</div>' +
                '<div class="item__delete"><button class="item__delete--btn">' +
                '<i class="ion-ios-close-outline"></i></button></div></div></div>';
            selector = DomStrings.incomeList;
        } else {
            listHtml =
                '<div class="item clearfix" id="exp-%id%">' +
                '<div class="item__description">%description%</div>' +
                '<div class="right clearfix">' +
                '<div class="item__value">%value%</div>' +
                '<div class="item__percentage">21%</div>' +
                '<div class="item__delete"> ' +
                '<button class="item__delete--btn">' +
                '<i class="ion-ios-close-outline" /></button></div></div></div>';
            selector = DomStrings.expenseList;
        }

        newListHtml = listHtml
            .replace("%id%", item.id)
            .replace("%description%", item.description)
            .replace("%value%", formatNumber(item.value, type));

        document
            .querySelector(selector)
            .insertAdjacentHTML("beforeend", newListHtml);
    };

    UiCtrl.displayBudget = function(budgetValue, budgetIncome, budgetExpenses) {
        document.querySelector(DomStrings.budgetValue).innerHTML = formatNumber(
            budgetValue,
            "budget"
        );
        document.querySelector(
            DomStrings.budgetIncome
        ).innerHTML = formatNumber(budgetIncome, "inc");
        document.querySelector(
            DomStrings.budgetExpenses
        ).innerHTML = formatNumber(budgetExpenses, "exp");
    };

    var formatNumber = function(number, type) {
        number = number.toFixed(2);
        if (type === "exp") {
            number = "- " + number;
        } else if (type === "inc" || (type === "budget" && number > 0)) {
            number = "+ " + number;
        } else if (number < 0) {
            number = -number;
            number = "- " + number;
        }
        return number;
    };

    UiCtrl.deleteListItem = function(id) {
        var element = document.getElementById(id);
        element.parentNode.removeChild(element);
    };

    return UiCtrl;
})();

var appController = (function(budgetController, UiController) {
    var DomStrings = UiController.getDomStrings();
    var controller = {};

    var setupEventListeners = function() {
        document
            .querySelector(DomStrings.addButton)
            .addEventListener("click", addItem);
        document.addEventListener("keypress", function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                addItem();
            }
        });

        document
            .querySelector(DomStrings.deleteButton)
            .addEventListener("click", deleteItem);
    };

    var addItem = function() {
        var input = UiController.getInput();

        if (isNaN(input.value) || input.description === "") return;

        var item = budgetController.createItem(
            input.type,
            input.description,
            input.value
        );

        UiController.addItemToList(input.type, item);
        updateBudget();
        UiController.clearInput();
    };

    var deleteItem = function(event) {
        var itemId, itm, id, type;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemId) {
            item = itemId.split("-");
            type = item[0];
            id = parseInt(item[1]);
            budgetController.deleteItem(type, id);
            UiController.deleteListItem(itemId);
            updateBudget();
        }
    };

    var updateBudget = function() {
        budgetController.calculateBudget();
        var barget = budgetController.getBudget();
        UiController.displayBudget(
            barget.budget,
            barget.totalInc,
            barget.totalExp
        );
    };

    controller.init = function() {
        console.log("Application Started");
        setupEventListeners();
        UiController.displayBudget(0, 0, 0);
    };

    return controller;
})(budgetController, UiController);

appController.init();
