/** Directories of part files; each part lives in `<directory>/<id>.yaml`, referenced from `project.yaml`. */
export const PROJECT_PART_DIRECTORIES = {
  models: "models",
  commands: "commands",
  servers: "servers",
  agents: "agents",
} as const;

export const PART_FILE_EXTENSION = ".yaml";

/** Matches only files the app wrote (a bare UUID name); anything else in these folders is never deleted. */
export const PART_FILE_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.yaml$/i;
