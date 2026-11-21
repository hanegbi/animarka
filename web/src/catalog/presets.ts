/**
 * Ready sets, as data. Adding one is a new row, later a row in the `presets` table.
 * M1 lists are drafts built from the 118 prototype birds. The full lists come with the catalog in M2.5.
 */
export type Preset = {
  id: string;
  title: string;
  description: string;
  ids: string[];
};

export const PRESETS: Preset[] = [
  {
    id: "owls",
    title: "Owls of the world",
    description: "Every owl in the set.",
    ids: [
      "tyto-alba",
      "asio-flammeus",
      "athene-noctua",
      "asio-otus",
      "bubo-bubo",
      "otus-scops",
      "strix-uralensis",
      "aegolius-funereus",
      "glaucidium-passerinum",
      "surnia-ulula",
      "tyto-longimembris",
      "bubo-virginianus",
    ],
  },
  {
    id: "garden-europe",
    title: "Garden birds of Europe",
    description: "Finches, woodpeckers and swallows you see near houses.",
    ids: [
      "fringilla-coelebs",
      "chloris-chloris",
      "carduelis-carduelis",
      "pyrrhula-pyrrhula",
      "spinus-spinus",
      "fringilla-montifringilla",
      "linaria-cannabina",
      "serinus-serinus",
      "dendrocopos-major",
      "picus-viridis",
      "hirundo-rustica",
      "delichon-urbicum",
      "athene-noctua",
      "psittacula-krameri",
    ],
  },
  {
    id: "raptors",
    title: "Birds of prey",
    description: "Falcons, eagles, hawks and harriers.",
    ids: [
      "falco-tinnunculus",
      "falco-subbuteo",
      "falco-peregrinus",
      "falco-naumanni",
      "falco-columbarius",
      "falco-vespertinus",
      "falco-rusticolus",
      "hieraaetus-pennatus",
      "milvus-migrans",
      "clanga-clanga",
      "circus-aeruginosus",
      "elanus-caeruleus",
      "aegypius-monachus",
      "circaetus-gallicus",
      "aquila-heliaca",
      "accipiter-nisus",
      "circus-macrourus",
      "circus-cyaneus",
      "haliaeetus-albicilla",
    ],
  },
  {
    id: "waterside",
    title: "By the water",
    description: "Ducks, swans, herons, egrets and kingfishers.",
    ids: [
      "alcedo-atthis",
      "aythya-fuligula",
      "spatula-querquedula",
      "anas-acuta",
      "spatula-clypeata",
      "mareca-penelope",
      "anas-platyrhynchos",
      "tadorna-ferruginea",
      "cygnus-olor",
      "anser-anser",
      "egretta-garzetta",
      "nycticorax-nycticorax",
      "ardea-alba",
      "ardea-purpurea",
      "ardea-cinerea",
      "botaurus-stellaris",
      "ardeola-ralloides",
    ],
  },
];
