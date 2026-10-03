# Fonte dos dados nutricionais

- Fonte primária: NEPA/UNICAMP, *Tabela Brasileira de Composição de Alimentos (TACO)*, 4ª edição, 2011.
- Publicação oficial: https://nepa.unicamp.br/wp-content/uploads/sites/27/2023/10/taco_4_edicao_ampliada_e_revisada.pdf
- Página de publicações do NEPA: https://nepa.unicamp.br/publicacoes/
- A base local `tacoFoods.json` contém os 597 alimentos da tabela de composição, reorganizados para pesquisa no app. A estrutura normalizada foi obtida de https://github.com/brolesi/taco, cuja documentação identifica a planilha original da TACO como fonte.
- Os valores originais referem-se a 100 g de parte comestível. Valores ausentes permanecem como `null`; o app não os apresenta como zero.
- A TACO descreve alimentos e preparos de referência; ela não cobre todas as marcas, receitas, variações de preparo, alergênicos ou contaminação cruzada.
