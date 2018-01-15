var budgetController = (function() {
    var budgetCtrl = {};
    var item;

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calculatePercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round(this.value / totalIncome * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
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

    budgetCtrl.calculatePercentages = function() {
        data.allItems.exp.forEach(function(item) {
            item.calculatePercentage(data.totals.inc);
        });
    };

    budgetCtrl.getPercentages = function() {
        var percentages = data.allItems.exp.map(function(item) {
            return item.getPercentage();
        });
        return percentages;
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
        budgetIncome: ".budget__income--value",
        budgetExpenses: ".budget__expenses--value",
        deleteButton: ".container",
        percentageLabel: ".item__percentage",
        budgetExpensesLable: ".budget__expenses--percentage",
        dateLabel: ".budget__title--month"
    };
    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
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

    UiCtrl.displayBudget = function(
        budgetValue,
        budgetIncome,
        budgetExpenses,
        budgetPercentage
    ) {
        document.querySelector(
            DomStrings.budgetValue
        ).textContent = formatNumber(budgetValue, "budget");
        document.querySelector(
            DomStrings.budgetIncome
        ).textContent = formatNumber(budgetIncome, "inc");
        document.querySelector(
            DomStrings.budgetExpenses
        ).textContent = formatNumber(budgetExpenses, "exp");

        if (budgetIncome > 0) {
            document.querySelector(DomStrings.budgetExpensesLable).textContent =
                budgetPercentage + "%";
        } else {
            document.querySelector(DomStrings.budgetExpensesLable).textContent =
                "---";
        }
    };

    UiCtrl.displayPercentages = function(percentages) {
        var labels = document.querySelectorAll(DomStrings.percentageLabel);
        nodeListForEach(labels, function(item, index) {
            if (percentages[index] > 0) {
                item.textContent = percentages[index] + "%";
                console.log(percentages[index] + "%");
            } else {
                item.textContent = "---";
            }
        });
    };

    UiCtrl.displayMonth = function() {
        var now, months, month, year;

        now = new Date();
        months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ];
        month = now.getMonth();

        year = now.getFullYear();
        document.querySelector(DomStrings.dateLabel).textContent =
            months[month] + " " + year;
    };

    UiCtrl.changedType = function() {
        var fields = document.querySelectorAll(
            DomStrings.type +
                "," +
                DomStrings.description +
                "," +
                DomStrings.value
        );

        nodeListForEach(fields, function(cur) {
            cur.classList.toggle("red-focus");
        });

        document.querySelector(DomStrings.addButton).classList.toggle("red");
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

        document
            .querySelector(DomStrings.type)
            .addEventListener("change", UiController.changedType);
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
        updatePercentages();
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
            updatePercentages();
        }
    };

    var updateBudget = function() {
        budgetController.calculateBudget();
        var budget = budgetController.getBudget();
        UiController.displayBudget(
            budget.budget,
            budget.totalInc,
            budget.totalExp,
            budget.percentage
        );
    };

    var updatePercentages = function() {
        budgetController.calculatePercentages();
        var percentages = budgetController.getPercentages();
        UiController.displayPercentages(percentages);
    };

    controller.init = function() {
        console.log("Application Started");
        UiController.displayMonth();
        UiController.displayBudget(0, 0, 0, -1);
        setupEventListeners();
    };

    return controller;
})(budgetController, UiController);

appController.init();
