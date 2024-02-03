const Category = require("../models/category");
const Item = require("../models/item");

const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.index = asyncHandler(async (req, res, next) => {
  const [
    numCategories,
    numItems
  ] = await Promise.all([
    Category.countDocuments({}).exec(),
    Item.countDocuments({}).exec()
  ]);

  res.render("index", {
    title: "Grocery Inventory Home",
    category_count: numCategories,
    item_count: numItems
  });
});

// Display list of all Categories.
exports.category_list = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find().sort({ name: 1 }).exec();
  res.render("category_list", {
    title: "Categories",
    category_list: allCategories
  });
});

// Display detail page for specific category.
exports.category_detail = asyncHandler(async (req, res, next) => {
  const [category, itemsInCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }).exec()
  ]);
  
  if (category === null) {
    // No results.
    const err = new Error("Category not found");
    err.status = 404;
    return next(err);
  }

  res.render("category_detail", {
    title: "Category Detail",
    category: category,
    items: itemsInCategory
  });
});

// Display Category create form on GET.
exports.category_create_get = asyncHandler(async (req, res, next) => {
  res.render("category_form", { title: "Create Category"});
});

// Handle Category create on POST.
exports.category_create_post = [
  body("name", "Category name must be between 3 and 50 characters")
  .trim()
  .isLength({ min: 3, max: 50 })
  .escape(),
  body("description", "Description must contain be between 5 and 200 characters")
  .trim()
  .isLength({ min: 5, max: 200 })
  .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const category = new Category({ name: req.body.name, description: req.body.description });

    if (!errors.isEmpty()) {
      res.render("category_form", {
        title: "Create Category",
        errors: errors.array()
      });
    } else {
      await category.save();
      res.redirect(category.url);
    }
  })
];

// Display Category delete form on GET.
exports.category_delete_get = asyncHandler(async (req, res, next) => {
  const [category, allItemsInCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }).sort({ name: 1 }).exec()
  ]);

  if (category === null) {
    res.redirect("/categories");
  }

  res.render("category_delete", {
    title: "Delete Category",
    category: category,
    items: allItemsInCategory
  });
});

// Handle Category delete on POST.
exports.category_delete_post = asyncHandler(async (req, res, next) => {
  const [category, allItemsInCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }).sort({ name: 1 }).exec()
  ]);

  if (allItemsInCategory.length > 0) {
    res.render("category_delete", {
      title: "Delete Category",
      category: category,
      items: allItemsInCategory
    });
    return;
  } else {
    await Category.findByIdAndDelete(req.body.categoryid);
    res.redirect("/categories")
  }
});

// Display Category update form on GET.
exports.category_update_get = asyncHandler(async (req, res, next) => {
  const [category, allItemsInCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }).sort({ name: 1 }).exec()
  ]);

  if (category === null) {
    const err = new Error("Category not found");
    err.status = 404;
    return next(err);
  }

  res.render("category_form", {
    title: "Update Category",
    category: category
  });
});
//
// Handle Category update form on POST.
exports.category_update_post = [
  body("name", "Category name must be between 3 and 50 characters")
  .trim()
  .isLength({ min: 3, max: 50 })
  .escape(),
  body("description", "Description must contain be between 5 and 200 characters")
  .trim()
  .isLength({ min: 5, max: 200 })
  .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const category = new Category({ name: req.body.name, description: req.body.description, _id: req.params.id });

    if (!errors.isEmpty()) {
      res.render("category_form", {
        title: "Update Category",
        category: category,
        errors: errors.array()
      });
    } else {
      const updatedCategory = await Category.findByIdAndUpdate(req.params.id, category, {});
      res.redirect(updatedCategory.url);
    }
  })
];

