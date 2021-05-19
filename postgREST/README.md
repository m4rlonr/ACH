# Dados para o postgREST

[Configuração arquivo config](https://postgrest.org/en/v7.0.0/configuration.html#db-uri)
[Instação e guia inicial](https://postgrest.org/en/v7.0.0/tutorials/tut0.html)

# Exemplo de resquisição insomnia

		http://localhost:3000/reserva?data_reserva=eq.2019-11-16

# SQL DBeaver

		--grant usage on schema reservas to web_anon;
		--grant select on reservas.objeto to web_anon;

		--create role postgresteste noinherit login password 'postgres';
		--grant web_anon to postgres;

		grant select on reservas.reserva to web_anon;