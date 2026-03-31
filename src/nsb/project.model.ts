export type AuthorName = string;

export type Version = string;

export type Link = string;

export type ProjectCommands = Record<string,string>;

export interface ProjectHostLinks {
  link?: Link,
  cdn?: Link,
  home?: Link,
  issues?: Link,
  feedback?: Link,
  help?: Link,
  docs?: Link,
  reference?: Link,
  dashboard?: Link,
  support?: Link,
  [index: string]: string | undefined,
}

export interface ProjectHost extends ProjectHostLinks {
  service: string,
  
}

export interface ProjectStructure {
    title: string,
    version: Version,
    description?: string,
    entrance: string,
    host: ProjectHost | {},
    author: AuthorName,
    license: string,
    commands: ProjectCommands
}