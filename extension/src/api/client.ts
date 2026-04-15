import ky from "ky";

export const api = ky.create({
  prefix: "http://localhost:8080/",
  timeout: 10_000,
});
