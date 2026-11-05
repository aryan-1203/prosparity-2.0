/** Names and photos come from company material, prosparity.in and the company. Roles and bios are in messages. */
export interface Person { id: string; name: string; photo: string | null; linkedin?: string }

export const founders: readonly Person[] = [
  { id: "saurabh", name: "Saurabh Khodke", photo: "/team/saurabh.png", linkedin: "https://www.linkedin.com/in/saurabh-khodke-80694240/" },
  { id: "anirudh", name: "Anirudh Dhakar", photo: "/team/anni.png", linkedin: "https://www.linkedin.com/in/anirudh-dhakar-78979a4b/" },
  { id: "hakam", name: "Hakam Singh Dhakar", photo: "/team/hakam-dhakar.png", linkedin: "https://www.linkedin.com/in/hakam-singh-dhakar-935bb9317/" },
  { id: "jitendra", name: "Jitendra Sharma", photo: "/team/jitendra-sharma.png", linkedin: "https://www.linkedin.com/in/jitendra-sharma-256008318/" },
];

export const core: readonly Person[] = [
  { id: "anuj", name: "Anuj Jain", photo: "/team/anuj.png", linkedin: "https://www.linkedin.com/in/anuj-jain-817a761bb/" },
  { id: "kanishk", name: "Kanishk Agarwal", photo: "/team/kanishk.png", linkedin: "https://www.linkedin.com/in/kanishk-agarwal" },
  { id: "harry", name: "Harendra Singh Matiyali", photo: "/team/harry.png", linkedin: "https://www.linkedin.com/in/harendra-singh-matiyali-b370395a/" },
  { id: "sunil", name: "Sunil Dubey", photo: "/team/sunil-dubey.png", linkedin: "https://www.linkedin.com/in/sunil-dubey-aa121931a/" },
  { id: "rahul", name: "Rahul Pandey", photo: "/team/rahulpandey.png", linkedin: "https://www.linkedin.com/in/rahul-pandey-871013194/" },
];

export const advisor: Person = { id: "girish", name: "Girish Chawla", photo: null };
