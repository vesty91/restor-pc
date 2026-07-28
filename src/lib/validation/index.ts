/**
 * Validations Zod partagées Restor-PC.
 *
 * Règle : toute entrée utilisateur doit rester validée côté serveur.
 * Les schémas client ne sont jamais suffisants seuls.
 */

export * from "./common";
export * from "./auth";
export * from "./contact";
export * from "./checkout";
export * from "./orders";
export * from "./licenses";
export * from "./configurator";
export * from "./admin";
