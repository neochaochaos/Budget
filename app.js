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
        }
    };

    budgetCtrl.createItem = function(type, description, value) {
        var id;
        if (data.allItems[type].length > 0) {
            id = allItems[type][allItems[type].length - 1].id + 1;
        } else {
            id = 0;
        }
        alert(type);
        if (type === "exp") {
            item = new Expense(id, description, value);
        } else {
            item = new Income(id, description, value);
        }
        data.allItems[type].push(item);

        return item;
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
        expenseList: ".expenses__list"
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
                '<div class="item__description">%description</div>' +
                '<div class="right clearfix">' +
                '<div class="item__value">%value</div>' +
                '<div class="item__percentage">21%</div>' +
                '<div class="item__delete"> ' +
                '<button class="item__delete--btn">' +
                '<i class="ion-ios-close-outline" /></button></div></div></div>';
            selector = DomStrings.expenseList;
        }

        newListHtml = listHtml
            .replace("%id%", item.id)
            .replace("%description%", item.description)
            .replace("%value%", item.value);

        document
            .querySelector(selector)
            .insertAdjacentHTML("beforeend", newListHtml);
    };

    return UiCtrl;
})();

var controller = (function(budgetController, UiController) {
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
    };

    var addItem = function() {
        var input = UiController.getInput();
        alert(input.type);
        var item = budgetController.createItem(
            input.type,
            input.description,
            input.value
        );

        UiController.addItemToList(input.type, item);
    };

    controller.init = function() {
        console.log("Application Started");
        setupEventListeners();
    };

    return controller;
})(budgetController, UiController);

controller.init();
