export const allergyOptions = [
  'Leite',
  'Ovos',
  'Peixes',
  'Crustáceos',
  'Amendoim',
  'Castanhas',
  'Soja',
  'Trigo / glúten',
  'Lactose',
] as const;

export type MealIdea = {
  id: string;
  name: string;
  ingredients: string;
  avoids: string[];
  note: string;
};

export const mealIdeas: Record<string, MealIdea[]> = {
  Café: [
    { id: 'cuscuz-ovo', name: 'Cuscuz com ovos e fruta', ingredients: 'Cuscuz de milho, ovos mexidos e mamão ou banana.', avoids: ['Ovos'], note: 'Carboidrato, proteína e fruta em uma refeição simples.' },
    { id: 'tapioca-frango', name: 'Tapioca com frango', ingredients: 'Tapioca, frango desfiado e tomate; fruta à parte.', avoids: [], note: 'Uma opção sem leite; confira os ingredientes do recheio.' },
    { id: 'iogurte-aveia', name: 'Iogurte, fruta e aveia', ingredients: 'Iogurte natural, banana e aveia certificada sem glúten quando necessário.', avoids: ['Leite', 'Lactose', 'Trigo / glúten'], note: 'Escolha iogurte sem açúcar adicionado se preferir. Para evitar glúten, use aveia certificada e confira o rótulo.' },
    { id: 'pao-ovo', name: 'Pão com ovo e fruta', ingredients: 'Pão, ovo mexido e uma fruta da estação.', avoids: ['Trigo / glúten', 'Ovos'], note: 'Troque o pão por mandioca ou batata se precisar evitar trigo.' },
  ],
  Almoço: [
    { id: 'arroz-feijao-frango', name: 'Arroz, feijão e frango', ingredients: 'Arroz, feijão, frango preparado e legumes ou verduras.', avoids: [], note: 'Combinação brasileira versátil; varie os vegetais e temperos.' },
    { id: 'lentilha-abobora', name: 'Lentilha com arroz e abóbora', ingredients: 'Lentilha, arroz, abóbora assada e folhas.', avoids: [], note: 'Leguminosas também fornecem proteína e fibras.' },
    { id: 'arroz-sardinha', name: 'Arroz, feijão e sardinha', ingredients: 'Arroz, feijão, sardinha e salada ou legumes.', avoids: ['Peixes'], note: 'Se usar enlatada, compare o teor de sódio no rótulo.' },
    { id: 'arroz-tofu', name: 'Arroz, feijão e tofu', ingredients: 'Arroz, feijão, tofu dourado e legumes.', avoids: ['Soja'], note: 'Alternativa vegetal; confira temperos e rótulos.' },
  ],
  Lanche: [
    { id: 'fruta-grao', name: 'Fruta com grão-de-bico crocante', ingredients: 'Fruta fresca e grão-de-bico assado em casa.', avoids: [], note: 'Uma opção prática com alimentos simples.' },
    { id: 'tapioca-frango-lanche', name: 'Tapioca com frango', ingredients: 'Tapioca, frango desfiado e tomate.', avoids: [], note: 'Pode ser preparada com sobras bem conservadas.' },
    { id: 'iogurte-fruta', name: 'Iogurte natural com fruta', ingredients: 'Iogurte natural e fruta picada.', avoids: ['Leite', 'Lactose'], note: 'Pode trocar por fruta e uma porção de leguminosa torrada.' },
    { id: 'milho-amendoim', name: 'Milho cozido e fruta', ingredients: 'Milho cozido e uma fruta da estação.', avoids: [], note: 'Opção sem amendoim e sem laticínios.' },
  ],
  Jantar: [
    { id: 'omelete-batata', name: 'Omelete com batata e legumes', ingredients: 'Ovos, batata cozida e legumes refogados.', avoids: ['Ovos'], note: 'Inclua arroz, mandioca ou pão se combinar com sua fome e rotina.' },
    { id: 'arroz-feijao-frango-jantar', name: 'Arroz, feijão e frango', ingredients: 'Arroz, feijão, frango preparado e vegetais.', avoids: [], note: 'Uma refeição completa com ingredientes conhecidos.' },
    { id: 'sardinha-mandioca', name: 'Sardinha com mandioca e salada', ingredients: 'Sardinha, mandioca cozida e folhas ou legumes.', avoids: ['Peixes'], note: 'Substitua a sardinha por frango, ovo ou leguminosas conforme suas necessidades.' },
    { id: 'lentilha-arroz-jantar', name: 'Lentilha, arroz e vegetais', ingredients: 'Lentilha, arroz e legumes da estação.', avoids: [], note: 'Uma alternativa vegetal sem soja.' },
  ],
};

export const nutritionSources = [
  { label: 'Guia Alimentar para a População Brasileira · Ministério da Saúde', url: 'https://bvsms.saude.gov.br/bvs/publicacoes/guia_alimentar_populacao_brasileira_2ed.pdf' },
  { label: 'Rotulagem de alergênicos · Anvisa', url: 'https://www.gov.br/anvisa/pt-br/centraisdeconteudo/publicacoes/alimentos/perguntas-e-respostas-arquivos/rotulagem-de-alergenicos.pdf' },
  { label: 'Alimentação saudável · Organização Mundial da Saúde', url: 'https://www.who.int/news-room/fact-sheets/detail/healthy-diet' },
];
