-- Nuevo sector: infoproductores y coaches (para ofrecerles el setter con IA).
alter table negocios drop constraint negocios_sector_check;
alter table negocios add constraint negocios_sector_check check (sector in ('fitness', 'clinica', 'hosteleria', 'infoproducto', 'otro'));
