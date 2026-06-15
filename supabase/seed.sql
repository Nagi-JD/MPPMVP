insert into categories (slug, name) values
  ('football','Football'), ('esports','Esports'),
  ('basketball','Basketball'), ('tennis','Tennis')
on conflict do nothing;
