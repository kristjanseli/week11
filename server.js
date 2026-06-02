const express = require("express");
const db = require("./db");

const app = express();

app.get("/", (req, res) => {
  res.send("OK ✅");
});

// 1) Retseptid
app.get("/recipes", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM recipe ORDER BY id;");
    res.json(result.rows);
  } catch (err) {
    console.error("DB error /recipes:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// 2) Koostisosad
app.get("/ingredients", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM ingredient ORDER BY id;");
    res.json(result.rows);
  } catch (err) {
    console.error("DB error /ingredients:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// 3) Retsept + koostisosade list (JOIN)
app.get("/recipes-with-ingredients", async (req, res) => {
  try {
    const q = `
      SELECT
        r.id,
        r.recipename,
        json_agg(i.ingredientname ORDER BY i.id) AS ingredients
      FROM recipe r
      JOIN ingredientinrecipe ir ON ir.recipeid = r.id
      JOIN ingredient i ON i.id = ir.ingredientid
      GROUP BY r.id, r.recipename
      ORDER BY r.id;
    `;
    const result = await db.query(q);
    res.json(result.rows);
  } catch (err) {
    console.error("DB error /recipes-with-ingredients:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// 4) Täielikud retseptid koos koostisosade ja juhistega
app.get("/fullRecipes", async (req, res) => {
  try {
    const q = `
      SELECT
        r.id,
        r.recipename,
        r.instructions,
        json_agg(i.ingredientname ORDER BY i.id) AS ingredients
      FROM recipe r
      JOIN ingredientinrecipe ir ON ir.recipeid = r.id
      JOIN ingredient i ON i.id = ir.ingredientid
      GROUP BY r.id, r.recipename, r.instructions
      ORDER BY r.id;
    `;
    const result = await db.query(q);
    res.json(result.rows);
  } catch (err) {
    console.error("DB error /fullRecipes:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// 5) Otsing retsepti nime järgi
app.get("/fullRecipes/search", async (req, res) => {
  try {
    const { recipeName } = req.query;
    const q = `
      SELECT
        r.id,
        r.recipename,
        r.instructions,
        json_agg(i.ingredientname ORDER BY i.id) AS ingredients
      FROM recipe r
      JOIN ingredientinrecipe ir ON ir.recipeid = r.id
      JOIN ingredient i ON i.id = ir.ingredientid
      WHERE r.recipename = $1
      GROUP BY r.id, r.recipename, r.instructions
      ORDER BY r.id;
    `;
    const result = await db.query(q, [recipeName]);
    res.json(result.rows);
  } catch (err) {
    console.error("DB error /fullRecipes/search:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// --- CRUD ---

// POST - lisa uus retsept
app.use(express.json());

app.post("/recipes", async (req, res) => {
  try {
    const { recipename, instructions } = req.body;
    const result = await db.query(
      "INSERT INTO recipe (recipename, instructions) VALUES ($1, $2) RETURNING *;",
      [recipename, instructions]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("DB error POST /recipes:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// PUT - uuenda retsept
app.put("/recipes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { recipename, instructions } = req.body;
    const result = await db.query(
      "UPDATE recipe SET recipename = $1, instructions = $2 WHERE id = $3 RETURNING *;",
      [recipename, instructions, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("DB error PUT /recipes:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// DELETE - kustuta retsept
app.delete("/recipes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM ingredientinrecipe WHERE recipeid = $1;", [id]);
    await db.query("DELETE FROM recipe WHERE id = $1;", [id]);
    res.json({ message: "Recipe deleted" });
  } catch (err) {
    console.error("DB error DELETE /recipes:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// POST - lisa uus koostisosa
app.post("/ingredients", async (req, res) => {
  try {
    const { ingredientname } = req.body;
    const result = await db.query(
      "INSERT INTO ingredient (ingredientname) VALUES ($1) RETURNING *;",
      [ingredientname]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("DB error POST /ingredients:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// POST - lisa koostisosa retseptile
app.post("/recipes/:id/ingredients", async (req, res) => {
  try {
    const { id } = req.params;
    const { ingredientname } = req.body;
    const ingResult = await db.query(
      "INSERT INTO ingredient (ingredientname) VALUES ($1) ON CONFLICT DO NOTHING RETURNING id;",
      [ingredientname]
    );
    const ingredientid = ingResult.rows[0]?.id ||
      (await db.query("SELECT id FROM ingredient WHERE ingredientname = $1;", [ingredientname])).rows[0].id;
    await db.query(
      "INSERT INTO ingredientinrecipe (recipeid, ingredientid) VALUES ($1, $2) ON CONFLICT DO NOTHING;",
      [id, ingredientid]
    );
    res.status(201).json({ message: "Ingredient added to recipe" });
  } catch (err) {
    console.error("DB error POST /recipes/:id/ingredients:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// 6) Juhuslik retsept
app.get("/randomRecipe", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, recipename, instructions FROM recipe ORDER BY RANDOM() LIMIT 1;"
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("DB error /randomRecipe:", err);
    res.status(500).json({ error: "Database error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server is running on Port " + PORT);
});