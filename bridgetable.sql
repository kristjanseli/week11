SELECT * FROM ingredientinrecipe ORDER BY recipeid, ingredientid;

INSERT INTO ingredientinrecipe (recipeid, ingredientid)
SELECT r.id, i.id
FROM recipe r
JOIN ingredient i
  ON r.recipename = 'Pumpkin Pasties'
 AND i.ingredientname IN (
  'pumpkin puree',
  'sugar',
  'cinnamon',
  'nutmeg',
  'cloves',
  'Pastry dough',
  'Egg wash (1 egg beaten with a splash of milk)',
  'brown sugar'
 )
ON CONFLICT DO NOTHING;

INSERT INTO ingredientinrecipe (recipeid, ingredientid)
SELECT r.id, i.id
FROM recipe r
JOIN ingredient i
  ON r.recipename = 'Pumpkin Tartlets'
 AND i.ingredientname IN (
  'pumpkin puree',
  'sugar',
  'cinnamon',
  'nutmeg',
  'cloves',
  'ginger',
  'Mini tart shells'
 )
ON CONFLICT DO NOTHING;

INSERT INTO ingredientinrecipe (recipeid, ingredientid)
SELECT r.id, i.id
FROM recipe r
JOIN ingredient i
  ON r.recipename = 'Creamy Pumpkin Soup'
 AND i.ingredientname IN (
  'pumpkin puree',
  'onion, chopped',
  'garlic, minced',
  'vegetable broth',
  'heavy cream',
  'Salt and pepper to taste',
  'Whipped cream for garnish'
 )
ON CONFLICT DO NOTHING;

SELECT r.recipename, i.ingredientname
FROM recipe r
JOIN ingredientinrecipe ir ON ir.recipeid = r.id
JOIN ingredient i ON i.id = ir.ingredientid
ORDER BY r.recipename, i.ingredientname;