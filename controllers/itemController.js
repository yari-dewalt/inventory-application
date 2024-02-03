const Item = require("../models/item");
const Category = require("../models/category");

const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display list of all Items.
exports.item_list = asyncHandler(async (req, res, next) => {
  const allItems = await Item.find().sort({ name: 1 }).populate("category").exec();
  res.render("item_list", {
    title: "Items",
    item_list: allItems
  });
});

// Display detail page for specific item.
exports.item_detail = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id).populate("category").exec();

  if (item === null) {
    // No results.
    const err = new Error("Item not found");
    err.status = 404;
    return next(err);
  }

  res.render("item_detail", {
    title: "Item Detail",
    item: item
  });
});

// Display Item create form on GET.
exports.item_create_get = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find().sort({ name: 1 }).exec();

  res.render("item_form", { title: "Create Item", categories: allCategories });
});

// Handle Item create on POST.
exports.item_create_post = [
  body("name", "Item name must be between 1 and 30 characters")
  .trim()
  .isLength({ min: 1, max: 30 })
  .escape(),
  body("description", "Description must contain be between 5 and 200 characters")
  .trim()
  .isLength({ min: 5, max: 200 })
  .escape(),
  body("category", "Category must not be empty")
  .trim()
  .isLength({ min: 1 })
  .escape(),
  body("price", "Price must be a number larger than 0")
  .trim()
  .isFloat({ min: 0 })
  .escape(),
  body("amount", "Amount must be at least 1")
  .trim()
  .isInt({ min: 1})
  .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      amount: req.body.amount
    });

    if (!errors.isEmpty()) {
      const allCategories = await Category.find().sort({ name: 1 }).exec();

      res.render("item_form", {
        title: "Create Item",
        categories: allCategories,
        errors: errors.array()
      });
    } else {
      await item.save();
      res.redirect(item.url);
    }
  })
];

// Display Item delete form on GET.
exports.item_delete_get = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id).exec();

  if (item === null) {
    res.redirect("/items");
  }

  res.render("item_delete", {
    title: "Delete Item",
    item: item,
  });
});

// Handle Item delete on POST.
exports.item_delete_post = asyncHandler(async (req, res, next) => {
  await Item.findByIdAndDelete(req.body.itemid);
  res.redirect("/items");
});

// Display Item update form on GET.
exports.item_update_get = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id).exec();
  const allCategories = await Category.find().sort({ name: 1 }).exec();

  if (item === null) {
    const err = new Error("Category not found");
    err.status = 404;
    return next(err);
  }

  res.render("item_form", {
    title: "Update Item",
    item: item,
    categories: allCategories
  });
});

// Handle Item update form on POST.
exports.item_update_post = [
  body("name", "Item name must be between 1 and 30 characters")
  .trim()
  .isLength({ min: 1, max: 30 })
  .escape(),
  body("description", "Description must contain be between 5 and 200 characters")
  .trim()
  .isLength({ min: 5, max: 200 })
  .escape(),
  body("category", "Category must not be empty")
  .trim()
  .isLength({ min: 1 })
  .escape(),
  body("price", "Price must be a number larger than 0")
  .trim()
  .isFloat({ min: 0 })
  .escape(),
  body("amount", "Amount must be at least 1")
  .trim()
  .isInt({ min: 1})
  .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      amount: req.body.amount,
      _id: req.params.id
    });

    console.log(item);

    if (!errors.isEmpty()) {
      const allCategories = await Category.find().sort({ name: 1 }).exec();

      res.render("item_form", {
        title: "Update Item",
        categories: allCategories,
        item: item,
        errors: errors.array()
      });
    } else {
      const updatedItem = await Item.findByIdAndUpdate(req.params.id, item, {});
      res.redirect(updatedItem.url);
    }
  })
];
