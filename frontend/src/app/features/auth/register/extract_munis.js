
const html = `
<option data-content="AZUAY / NABON" value="a91c1713-fff9-436b-9682-8914b2340f53">AZUAY / NABON</option>
<option data-content="AZUAY / PUCARA" value="ccb7c435-71d9-4a72-aec7-a79c1e7cc0dc">AZUAY / PUCARA</option>
<option data-content="AZUAY / SANTA ISABEL" value="7e4ff57d-f266-450c-a168-cbddf95e363d">AZUAY / SANTA ISABEL</option>
<option data-content="AZUAY / CHORDELEG" value="21ca4a66-336d-422a-a14a-df310e02d0ec">AZUAY / CHORDELEG</option>
<option data-content="AZUAY / SAN FERNANDO" value="54376317-64bf-420d-a3e1-4d8433a6b6c8">AZUAY / SAN FERNANDO</option>
<option data-content="AZUAY / OÑA" value="684cab28-dc14-4b14-9f0c-3b2b84b14221">AZUAY / OÑA</option>
<option data-content="AZUAY / GIRON" value="737fd839-30db-425a-8278-5fc3ec81309f">AZUAY / GIRON</option>
<option data-content="AZUAY / GUALACEO" value="18462c0c-734b-467f-8591-84573e9b94e9">AZUAY / GUALACEO</option>
<option data-content="AZUAY / CUENCA" value="63fcb201-faa8-49eb-964c-009f68810e14">AZUAY / CUENCA</option>
<option data-content="AZUAY / EL PAN" value="818f0e7a-6be8-4d92-8b34-1f65a7923970">AZUAY / EL PAN</option>
<option data-content="AZUAY / PAUTE" value="2df10b9b-2fb2-4a13-9754-ed46f21ede31">AZUAY / PAUTE</option>
<option data-content="AZUAY / SEVILLA DE ORO" value="927bf1a9-2aa3-43ed-a667-1c2dcfc28851">AZUAY / SEVILLA DE ORO</option>
<option data-content="AZUAY / GUACHAPALA" value="46bcd7fb-322e-442b-b25c-5f4560b9dfee">AZUAY / GUACHAPALA</option>
<option data-content="AZUAY / CAMILO PONCE ENRIQUEZ" value="f26760a8-5bc5-4c83-9fb0-48a5c1d825e5">AZUAY / CAMILO PONCE ENRIQUEZ</option>
<option data-content="AZUAY / SIGSIG" value="30a65ce5-ecdf-4860-8d6e-9dcb3defecca">AZUAY / SIGSIG</option>
<option data-content="BOLIVAR / SAN MIGUEL" value="eac7fb32-c847-480e-a92b-077300964960">BOLIVAR / SAN MIGUEL</option>
<option data-content="BOLIVAR / GUARANDA" value="63fac0aa-2f40-4cf2-956d-6d64b883b76d">BOLIVAR / GUARANDA</option>
<option data-content="BOLIVAR / ECHEANDIA" value="6280dbcf-035c-4aff-9640-6be5c020ffd9">BOLIVAR / ECHEANDIA</option>
<option data-content="BOLIVAR / LAS NAVES" value="d74ef8bd-4889-4c71-9ea3-192aa7d8150e">BOLIVAR / LAS NAVES</option>
<option data-content="BOLIVAR / CALUMA" value="395ce542-1c34-4409-85e9-2b2763840f5b">BOLIVAR / CALUMA</option>
<option data-content="BOLIVAR / CHILLANES" value="b019e28c-7d96-49d6-987e-29bd840dd941">BOLIVAR / CHILLANES</option>
<option data-content="BOLIVAR / SAN JOSE DE CHIMBO" value="d336e03f-358a-486b-b95f-74890b0b4f92">BOLIVAR / SAN JOSE DE CHIMBO</option>
<option data-content="CAÑAR / AZOGUES" value="2347d2c0-18fc-45fb-85c8-655ccbb12fa5">CAÑAR / AZOGUES</option>
<option data-content="CAÑAR / CAÑAR" value="c5cfbefd-b00f-4fa8-a3bb-c7d6bb571e02">CAÑAR / CAÑAR</option>
<option data-content="CAÑAR / DELEG" value="9a574dad-1991-43d5-83b7-1367bd7a6295">CAÑAR / DELEG</option>
<option data-content="CAÑAR / EL TAMBO" value="a9ecaab2-4c36-4274-be4a-f33a7a1eb695">CAÑAR / EL TAMBO</option>
<option data-content="CAÑAR / LA TRONCAL" value="25fb18d9-541d-4810-8868-6e410173db54">CAÑAR / LA TRONCAL</option>
<option data-content="CAÑAR / BIBLIAN" value="0349c73e-9304-4fc2-9670-4eebe4ea3bcd">CAÑAR / BIBLIAN</option>
<option data-content="CAÑAR / SUSCAL" value="b33df759-aaba-4ae4-928b-27ce4fd6f49b">CAÑAR / SUSCAL</option>
<option data-content="CARCHI / SAN PEDRO DE HUACA" value="166eac3c-30f2-4f56-a146-f77859b0a3a5">CARCHI / SAN PEDRO DE HUACA</option>
<option data-content="CARCHI / TULCAN" value="e6387c29-fba1-4fa8-8d07-f0e9d6bbbdfc">CARCHI / TULCAN</option>
<option data-content="CARCHI / MIRA" value="28566f2a-31e3-455d-a890-6a7e55c48290">CARCHI / MIRA</option>
<option data-content="CARCHI / MONTUFAR" value="597eb8f9-9029-453c-84d4-9e714b7ade07">CARCHI / MONTUFAR</option>
<option data-content="CARCHI / ESPEJO" value="bd703b92-a522-47a6-aaf6-ed72097ac713">CARCHI / ESPEJO</option>
<option data-content="CARCHI / LA MANA" value="d15d48eb-a113-4ccb-bdc8-b085500f6b87">CARCHI / LA MANA</option>
<option data-content="COTOPAXI / SALCEDO" value="72bf2cc3-6576-491c-a0e8-b0ce20245b55">COTOPAXI / SALCEDO</option>
<option data-content="COTOPAXI / SIGCHOS" value="e694b5f8-5b35-4927-921c-68ef2d7468db">COTOPAXI / SIGCHOS</option>
<option data-content="COTOPAXI / PUJILI" value="b7f43317-6a1f-4387-a88a-b2bcf79a5d9f">COTOPAXI / PUJILI</option>
<option data-content="COTOPAXI / SAQUISILI" value="3d72d716-ad21-4db0-ac27-fab9fc91fc59">COTOPAXI / SAQUISILI</option>
<option data-content="COTOPAXI / PANGUA" value="3b3f2d0e-ebe3-40b1-8e25-501227edb472">COTOPAXI / PANGUA</option>
<option data-content="COTOPAXI / LA MANA" value="4e28b949-426d-483b-97ab-b996aca4baec">COTOPAXI / LA MANA</option>
<option data-content="COTOPAXI / LATACUNGA" value="dcbaa150-51f3-44ba-97ad-7a54ea1ccf85">COTOPAXI / LATACUNGA</option>
<option data-content="CHIMBORAZO / PALLATANGA" value="830e0348-a81f-4262-80ef-b71077cdc991">CHIMBORAZO / PALLATANGA</option>
<option data-content="CHIMBORAZO / ALAUSI" value="80b79919-7a5c-4816-8e15-5131a5973100">CHIMBORAZO / ALAUSI</option>
<option data-content="CHIMBORAZO / CHUNCHI" value="ebe2f01a-7e32-4f52-b42a-a34fe8996ac3">CHIMBORAZO / CHUNCHI</option>
<option data-content="CHIMBORAZO / GUAMOTE" value="75c5513c-aa36-4877-aa9e-049732edd5e8">CHIMBORAZO / GUAMOTE</option>
<option data-content="CHIMBORAZO / CUMANDA" value="88dd9cc9-46e1-4158-a638-fa8d9f4762f0">CHIMBORAZO / CUMANDA</option>
<option data-content="CHIMBORAZO / CHAMBO" value="41e9c2e5-712d-4846-a6b1-e9b4df63ef4d">CHIMBORAZO / CHAMBO</option>
<option data-content="CHIMBORAZO / GUANO" value="11a65d66-2896-4585-b0eb-87e9db95b7d7">CHIMBORAZO / GUANO</option>
<option data-content="CHIMBORAZO / RIOBAMBA" value="de8feb09-42a2-45ce-9921-69410ed172d5">CHIMBORAZO / RIOBAMBA</option>
<option data-content="CHIMBORAZO / PENIPE" value="9e0edef8-228c-4f3d-9266-ff009732e457">CHIMBORAZO / PENIPE</option>
<option data-content="CHIMBORAZO / COLTA" value="23204cf2-8a9f-4588-8630-4092d3caec4e">CHIMBORAZO / COLTA</option>
<option data-content="EL ORO / PORTOVELO" value="f4704054-1e52-48a4-8173-ccf07c1d44d1">EL ORO / PORTOVELO</option>
<option data-content="EL ORO / CHILLA" value="f07bafe1-f390-4b36-924f-61801a6af161">EL ORO / CHILLA</option>
<option data-content="EL ORO / PIÑAS" value="75278a3b-6294-4348-997b-febfc56824aa">EL ORO / PIÑAS</option>
<option data-content="EL ORO / MARCABELI" value="6cf2a3ea-0178-4c75-ab4c-99ff8e9a78d9">EL ORO / MARCABELI</option>
<option data-content="EL ORO / HUAQUILLAS" value="dca5c170-f626-4ecd-935f-8d62eacb9257">EL ORO / HUAQUILLAS</option>
<option data-content="EL ORO / ATAHUALPA" value="69821a48-c767-4296-8a1e-f00f20766b58">EL ORO / ATAHUALPA</option>
<option data-content="EL ORO / EL GUABO" value="329b257c-4b74-4c12-bcbe-f8f65b874735">EL ORO / EL GUABO</option>
<option data-content="EL ORO / ZARUMA" value="37afe30e-c8f9-40f8-a6f9-c06ec6736b7a">EL ORO / ZARUMA</option>
<option data-content="EL ORO / MACHALA" value="0e8ddbd4-7512-40b0-8ed1-4a5ad8ef48e8">EL ORO / MACHALA</option>
<option data-content="EL ORO / BALSAS" value="1fa0ac4f-6600-42ca-99e9-bd4f171d2bfa">EL ORO / BALSAS</option>
<option data-content="EL ORO / SANTA ROSA" value="63b212c1-1033-4baa-b114-6050159dad02">EL ORO / SANTA ROSA</option>
<option data-content="EL ORO / PASAJE" value="3ab7a954-21ec-4f05-9443-bdab23a38b6f">EL ORO / PASAJE</option>
<option data-content="EL ORO / ARENILLAS" value="78b1a375-17d7-4e8d-ad2c-422053870e71">EL ORO / ARENILLAS</option>
<option data-content="EL ORO / LAS LAJAS" value="c2dac84c-b53a-461a-b875-7982de6289cd">EL ORO / LAS LAJAS</option>
<option data-content="ESMERALDAS / SAN LORENZO" value="e26c96c9-27da-4aaf-ace2-29d8b798eefc">ESMERALDAS / SAN LORENZO</option>
<option data-content="ESMERALDAS / QUININDE" value="70917a8c-1e89-4a89-ab57-867796826479">ESMERALDAS / QUININDE</option>
<option data-content="ESMERALDAS / ATACAMES" value="679f9e73-cc79-45d3-a05a-c6116f054e98">ESMERALDAS / ATACAMES</option>
<option data-content="ESMERALDAS / RIO VERDE" value="cfc97688-58e1-4d0f-83e7-337e64f0db9c">ESMERALDAS / RIO VERDE</option>
<option data-content="ESMERALDAS / MUISNE" value="f6cc2465-d886-44c7-984e-5a070b4f4aef">ESMERALDAS / MUISNE</option>
<option data-content="ESMERALDAS / ELOY ALFARO" value="ad0f3e82-ec76-4e02-96b7-35938d8348e7">ESMERALDAS / ELOY ALFARO</option>
<option data-content="ESMERALDAS / ESMERALDAS" value="11822d1c-fc6e-4d85-924e-3589b4aebdae">ESMERALDAS / ESMERALDAS</option>
<option data-content="GUAYAS / BALAO" value="889bf212-3aed-4d57-9883-3ec3d985b55e">GUAYAS / BALAO</option>
<option data-content="GUAYAS / NARANJAL" value="34dd8dc4-6851-416c-acdc-624672919035">GUAYAS / NARANJAL</option>
<option data-content="GUAYAS / SALITRE (URBINA JADO)" value="435cbc3f-a48c-43b8-a5ef-204c5e68c25d">GUAYAS / SALITRE (URBINA JADO)</option>
<option data-content="GUAYAS / SAN JACINTO DE YAGUACHI" value="62fb7166-be78-4bb0-8df7-3a6db87082cf">GUAYAS / SAN JACINTO DE YAGUACHI</option>
<option data-content="GUAYAS / DAULE" value="9f75a95d-fd9a-4d10-8270-71cc0989bcf0">GUAYAS / DAULE</option>
<option data-content="GUAYAS / ALFREDO BAQUERIZO MORENO" value="f5642db5-b494-42ae-a6c9-ff3e55047708">GUAYAS / ALFREDO BAQUERIZO MORENO</option>
<option data-content="GUAYAS / BALZAR" value="9f23b220-1d03-4cee-abfe-93730f609518">GUAYAS / BALZAR</option>
<option data-content="GUAYAS / DURAN" value="ad505695-c962-413d-89dc-e8d2d79f445b">GUAYAS / DURAN</option>
<option data-content="GUAYAS / MILAGRO" value="9878f9a8-6f49-4149-94a3-968fafb6fc44">GUAYAS / MILAGRO</option>
<option data-content="GUAYAS / ISIDRO AYORA" value="f1d8f634-b8c9-41e5-8206-436b91057e7c">GUAYAS / ISIDRO AYORA</option>
<option data-content="GUAYAS / COLIMES" value="c170c15c-5be7-4088-a107-669c45348cfd">GUAYAS / COLIMES</option>
<option data-content="GUAYAS / NARANJITO" value="0822db20-94b3-4e4f-9a2c-9a2233c74072">GUAYAS / NARANJITO</option>
<option data-content="GUAYAS / CORONEL MARCELINO MARIDUEÑA" value="98cf56bf-61c9-408b-86c1-7fbfcdcf953c">GUAYAS / CORONEL MARCELINO MARIDUEÑA</option>
<option data-content="GUAYAS / EL TRIUNFO" value="494fcb73-358c-4e18-beff-5012ef58701a">GUAYAS / EL TRIUNFO</option>
<option data-content="GUAYAS / EL EMPALME" value="314cdc6a-0b64-4420-94fb-7d00ad5cfd6f">GUAYAS / EL EMPALME</option>
<option data-content="GUAYAS / PEDRO CARBO" value="4e537662-acde-4806-8883-c6e38f90723d">GUAYAS / PEDRO CARBO</option>
<option data-content="GUAYAS / NOBOL" value="be4bf4e6-2cd2-4473-8fbd-bbe946152a84">GUAYAS / NOBOL</option>
<option data-content="GUAYAS / LOMAS DE SARGENTILLO" value="24b713f0-2cb7-4027-bcd3-fe28a9edac11">GUAYAS / LOMAS DE SARGENTILLO</option>
<option data-content="GUAYAS / PALESTINA" value="463dab05-ef1b-494e-a3e3-6a3e8560dc2b">GUAYAS / PALESTINA</option>
<option data-content="GUAYAS / SIMON BOLIVAR" value="4e7eaca4-8ed2-47bf-b029-ac4e6b44bec5">GUAYAS / SIMON BOLIVAR</option>
<option data-content="GUAYAS / PLAYAS" value="c343b17c-cf3b-4bb5-adea-d6eac2d5bd19">GUAYAS / PLAYAS</option>
<option data-content="GUAYAS / SANTA LUCIA" value="5f0be950-6c58-4397-8fb6-5c4f04bcb070">GUAYAS / SANTA LUCIA</option>
<option data-content="GUAYAS / GUAYAQUIL" value="4f8bc91d-9b97-49d4-a20e-d54d9a993fcb">GUAYAS / GUAYAQUIL</option>
<option data-content="GUAYAS / SAMBORONDON" value="34a14d10-8973-41a5-9319-936ec237ac2d">GUAYAS / SAMBORONDON</option>
<option data-content="GUAYAS / GENERAL ANTONIO ELIZALDE" value="4388ff6a-ebf7-43ce-92e3-f4fac99defd8">GUAYAS / GENERAL ANTONIO ELIZALDE</option>
<option data-content="IMBABURA / SAN MIGUEL DE URCUQUI" value="3ba169ea-5629-4b9b-b141-5950ea8ff3f7">IMBABURA / SAN MIGUEL DE URCUQUI</option>
<option data-content="IMBABURA / COTACACHI" value="01842280-2573-4181-8264-ea21e10b68ed">IMBABURA / COTACACHI</option>
<option data-content="IMBABURA / IBARRA" value="bf778deb-ea77-4bd1-9cf6-b037ea236504">IMBABURA / IBARRA</option>
<option data-content="IMBABURA / PIMAMPIRO" value="3cc76b08-3afb-4b51-84a1-82c44043e713">IMBABURA / PIMAMPIRO</option>
<option data-content="IMBABURA / ANTONIO ANTE" value="b1e08cfe-cc09-4d24-8c91-bdfbbffe1bb1">IMBABURA / ANTONIO ANTE</option>
<option data-content="IMBABURA / OTAVALO" value="45b3715a-26d2-45b4-9c56-2f1968e12032">IMBABURA / OTAVALO</option>
<option data-content="LOJA / CELICA" value="b6d25510-fc95-4c29-b867-c0cebceb8092">LOJA / CELICA</option>
<option data-content="LOJA / MACARA" value="d28ae630-754d-4589-8c74-a561eb149113">LOJA / MACARA</option>
<option data-content="LOJA / SOZORANGA" value="59249d8e-d80d-4a4b-959f-89f24dc0fc61">LOJA / SOZORANGA</option>
<option data-content="LOJA / SARAGURO" value="c785ef7d-4fde-41ae-a7c0-a418bd78e0a1">LOJA / SARAGURO</option>
<option data-content="LOJA / OLMEDO" value="d38d617a-3d02-45b4-a256-1dfb609f44d6">LOJA / OLMEDO</option>
<option data-content="LOJA / CALVAS" value="f24431f9-4a56-49ff-8c4d-9cf6b771ed64">LOJA / CALVAS</option>
<option data-content="LOJA / CATAMAYO" value="4b223eb8-921e-4cba-aa47-9ee96e412e34">LOJA / CATAMAYO</option>
<option data-content="LOJA / ESPINDOLA" value="df61a319-87e9-42db-a208-6b1dab5ae18a">LOJA / ESPINDOLA</option>
<option data-content="LOJA / CHAGUARPAMBA" value="9a16d4d3-4103-4188-af03-cc9442696535">LOJA / CHAGUARPAMBA</option>
<option data-content="LOJA / PINDAL" value="1911c889-b642-416f-9544-847c5ca5d0f4">LOJA / PINDAL</option>
<option data-content="LOJA / LOJA" value="a47e05f1-2a00-4ce9-b8a4-ce4f6cdf2d1a">LOJA / LOJA</option>
<option data-content="LOJA / GONZANAMA" value="abf01b44-a6a3-4cf3-aec7-e99ab00e02b7">LOJA / GONZANAMA</option>
<option data-content="LOJA / ZAPOTILLO" value="1b15ad0d-09cf-4518-9c5f-8bb825980085">LOJA / ZAPOTILLO</option>
<option data-content="LOJA / PUYANGO" value="124d35b3-f233-448e-83d5-ccdad13c6c04">LOJA / PUYANGO</option>
<option data-content="LOJA / QUILANGA" value="6a7b7041-5659-481c-8fbf-5fb0e8e4acb6">LOJA / QUILANGA</option>
<option data-content="LOJA / PALTAS" value="41846d63-b49f-4656-91be-f7c2d25aed9f">LOJA / PALTAS</option>
<option data-content="LOS RIOS / PUEBLO VIEJO" value="a3e5b1ba-ffb4-40d3-88e2-253e0cd9bad7">LOS RIOS / PUEBLO VIEJO</option>
<option data-content="LOS RIOS / BABA" value="728b29b3-48b1-41f6-903b-6c01f924c265">LOS RIOS / BABA</option>
<option data-content="LOS RIOS / BUENA FE" value="a1404f17-67ae-4fad-9f55-4590f417dee2">LOS RIOS / BUENA FE</option>
<option data-content="LOS RIOS / BABAHOYO" value="43bbc8b9-8137-4d99-af0a-9413e12e7d1e">LOS RIOS / BABAHOYO</option>
<option data-content="LOS RIOS / MONTALVO" value="32975bdb-1a7a-4ca7-bc9f-29e5abc2a102">LOS RIOS / MONTALVO</option>
<option data-content="LOS RIOS / VINCES" value="6dc01252-5925-4f33-af19-8a409ff2760c">LOS RIOS / VINCES</option>
<option data-content="LOS RIOS / QUEVEDO" value="0e56ea8b-4aeb-4047-977b-a44da3865bb7">LOS RIOS / QUEVEDO</option>
<option data-content="LOS RIOS / URDANETA" value="3639f7f1-5816-4799-acc6-e9bc0afa8e89">LOS RIOS / URDANETA</option>
<option data-content="LOS RIOS / VENTANAS" value="d2010670-40f1-4797-8498-8e1c3c450a31">LOS RIOS / VENTANAS</option>
<option data-content="LOS RIOS / VALENCIA" value="2d7ad8c4-aa07-41ed-a9e0-c58e079fc332">LOS RIOS / VALENCIA</option>
<option data-content="LOS RIOS / QUINSALOMA" value="8d15c4c5-fdfc-4625-b018-a49eafd4b425">LOS RIOS / QUINSALOMA</option>
<option data-content="LOS RIOS / MOCACHE" value="88870889-79ad-424e-a4f1-820b9beaa321">LOS RIOS / MOCACHE</option>
<option data-content="LOS RIOS / PALENQUE" value="2d6f6cb8-20b1-4cb7-ac2d-f5d22da18918">LOS RIOS / PALENQUE</option>
<option data-content="MANABI / PAJAN" value="6bb40e18-2d2d-4c33-a4df-cce4e662ba86">MANABI / PAJAN</option>
<option data-content="MANABI / SUCRE" value="2a8e60b6-d325-49d6-820c-6197090b2720">MANABI / SUCRE</option>
<option data-content="MANABI / EL CARMEN" value="8d76886e-2116-4486-910a-127dcd2665c0">MANABI / EL CARMEN</option>
<option data-content="MANABI / JUNIN" value="91f12886-5c0e-420c-a663-60c8197ed94a">MANABI / JUNIN</option>
<option data-content="MANABI / SAN VICENTE" value="358b1d39-2bde-4084-9530-b0a486600625">MANABI / SAN VICENTE</option>
<option data-content="MANABI / JARAMIJO" value="5c2dab31-57e8-4701-8dfc-063ea3a08a64">MANABI / JARAMIJO</option>
<option data-content="MANABI / PEDERNALES" value="2370be60-90d1-4512-8c4a-9b72706a7fdb">MANABI / PEDERNALES</option>
<option data-content="MANABI / PUERTO LOPEZ" value="e6fe875f-c216-4979-bb5f-16c27ae35ecf">MANABI / PUERTO LOPEZ</option>
<option data-content="MANABI / ROCAFUERTE" value="86554ce2-cf39-425c-9e26-44fc8af6cb84">MANABI / ROCAFUERTE</option>
<option data-content="MANABI / PICHINCHA" value="1a394598-19a1-4303-9310-3b6dc3f92f52">MANABI / PICHINCHA</option>
<option data-content="MANABI / 24 DE MAYO" value="4db6677b-4dfa-4ab3-911c-66de9073c8ad">MANABI / 24 DE MAYO</option>
<option data-content="MANABI / PORTOVIEJO" value="916b7171-7059-48d0-953b-5be205fb93b5">MANABI / PORTOVIEJO</option>
<option data-content="MANABI / MONTECRISTI" value="69c62205-120f-4e4d-9bbf-930de8cbe0a7">MANABI / MONTECRISTI</option>
<option data-content="MANABI / BOLIVAR" value="a8b78ae8-b7d4-4837-b44e-f4dfe3b2bdf0">MANABI / BOLIVAR</option>
<option data-content="MANABI / JAMA" value="8fbd558a-1e20-43d4-ad6f-68a886de8715">MANABI / JAMA</option>
<option data-content="MANABI / TOSAGUA" value="cd649f6c-85c6-4c3a-943d-7cf0e9259d78">MANABI / TOSAGUA</option>
<option data-content="MANABI / OLMEDO" value="8137fea0-218b-4b3c-bedc-14e623da73bc">MANABI / OLMEDO</option>
<option data-content="MANABI / SANTA ANA" value="f08a7362-cf32-4de9-a78a-b8b1cfbbe522">MANABI / SANTA ANA</option>
<option data-content="MANABI / CHONE" value="692c4826-b25b-4425-a911-7baa76430af6">MANABI / CHONE</option>
<option data-content="MANABI / JIPIJAPA" value="c397a872-3ea4-4b2f-b9e7-7040cda00a55">MANABI / JIPIJAPA</option>
<option data-content="MANABI / FLAVIO ALFARO" value="a380e05b-203d-4d34-994e-bf7a41f58bdf">MANABI / FLAVIO ALFARO</option>
<option data-content="MANABI / MANTA" value="7f130cc0-445b-4bf5-b3c1-2abb7b817985">MANABI / MANTA</option>
<option data-content="MORONA SANTIAGO / HUAMBOYA" value="4295f6d0-fb31-4ac0-8c1d-0b1ec489f82e">MORONA SANTIAGO / HUAMBOYA</option>
<option data-content="MORONA SANTIAGO / MORONA" value="2b69d459-3392-4721-8e16-f2a1d5c651d7">MORONA SANTIAGO / MORONA</option>
<option data-content="MORONA SANTIAGO / SANTIAGO" value="c86c6d47-13bd-4a32-af86-27793dbff93c">MORONA SANTIAGO / SANTIAGO</option>
<option data-content="MORONA SANTIAGO / SAN JUAN BOSCO" value="a0e016c2-4a40-4a11-89d1-3a5c3fefe51d">MORONA SANTIAGO / SAN JUAN BOSCO</option>
<option data-content="MORONA SANTIAGO / SUCUA" value="850239f4-974a-4009-873b-af84a14279c1">MORONA SANTIAGO / SUCUA</option>
<option data-content="MORONA SANTIAGO / TAISHA" value="20b69b48-863d-4491-ac0e-38937496b188">MORONA SANTIAGO / TAISHA</option>
<option data-content="MORONA SANTIAGO / GUALAQUIZA" value="f3759af3-97ac-43b6-b45f-ea06906b9b84">MORONA SANTIAGO / GUALAQUIZA</option>
<option data-content="MORONA SANTIAGO / TIWINTZA" value="f38f9127-0541-4f45-b0f7-7d22e59a3fea">MORONA SANTIAGO / TIWINTZA</option>
<option data-content="MORONA SANTIAGO / PABLO VI" value="3a3facb6-eb6f-4fc8-9da5-5ea488ba124b">MORONA SANTIAGO / PABLO VI</option>
<option data-content="MORONA SANTIAGO / PALORA" value="d874a201-bef3-47a0-88bf-8ddc6b678b7a">MORONA SANTIAGO / PALORA</option>
<option data-content="MORONA SANTIAGO / LIMON INDANZA" value="176b1903-7d44-45e8-9ae4-63604af7d1e5">MORONA SANTIAGO / LIMON INDANZA</option>
<option data-content="MORONA SANTIAGO / LOGROÑO" value="0d5895a1-1c4d-454c-9be4-2176b560076d">MORONA SANTIAGO / LOGROÑO</option>
<option data-content="NAPO / ARCHIDONA" value="f04727b8-b27d-4414-bb39-1374a19d4342">NAPO / ARCHIDONA</option>
<option data-content="NAPO / TENA" value="fcec7622-c73c-4964-89a3-d5a236f01bf6">NAPO / TENA</option>
<option data-content="NAPO / CARLOS JULIO AROSEMENA" value="4e1dcdae-afa7-4e3d-a759-92297206bfa6">NAPO / CARLOS JULIO AROSEMENA</option>
<option data-content="NAPO / QUIJOS" value="85423753-d1c3-4b94-9d45-b76e8ea19f8b">NAPO / QUIJOS</option>
<option data-content="NAPO / EL CHACO" value="7264290d-6736-4065-95e4-cb3e1e72bfd5">NAPO / EL CHACO</option>
<option data-content="ORELLANA / AGUARICO" value="917e8b82-4e20-41df-82e3-64d2049b854d">ORELLANA / AGUARICO</option>
<option data-content="ORELLANA / ORELLANA" value="d03d1157-5802-4b76-b076-b4c5835ec47e">ORELLANA / ORELLANA</option>
<option data-content="ORELLANA / LORETO" value="ea2f3ee6-dde3-4618-97d1-7329ba6f8b9f">ORELLANA / LORETO</option>
<option data-content="ORELLANA / LA JOYA DE LOS SACHAS" value="ca1e27e7-f44b-454e-9a74-8907f8987741">ORELLANA / LA JOYA DE LOS SACHAS</option>
<option data-content="PASTAZA / ARAJUNO" value="d3bd60bc-47a6-4f12-b50c-667ccbc317fc">PASTAZA / ARAJUNO</option>
<option data-content="PASTAZA / MERA" value="ae2e7fc4-7411-4739-8f8a-da2275c0750b">PASTAZA / MERA</option>
<option data-content="PASTAZA / SANTA CLARA" value="89df7ab5-743b-4f55-a6b3-739d75f830bc">PASTAZA / SANTA CLARA</option>
<option data-content="PASTAZA / PASTAZA" value="5a5cd8f2-a678-4bda-83a9-59e71904af66">PASTAZA / PASTAZA</option>
<option data-content="PICHINCHA / QUITO" value="0dd058f6-4e4f-4c64-8835-194693520d99">PICHINCHA / QUITO</option>
<option data-content="PICHINCHA / MEJIA" value="54879189-8973-45b3-a803-a53185645336">PICHINCHA / MEJIA</option>
<option data-content="PICHINCHA / RUMIÑAHUI" value="1f61b912-7e19-42a2-834d-fca3f1270538">PICHINCHA / RUMIÑAHUI</option>
<option data-content="PICHINCHA / SAN MIGUEL DE LOS BANCOS" value="0caff0f6-13cb-4225-80d8-cfb63d93e68e">PICHINCHA / SAN MIGUEL DE LOS BANCOS</option>
<option data-content="PICHINCHA / CAYAMBE" value="5ab923f4-ecea-40ab-b3c9-150a600d450c">PICHINCHA / CAYAMBE</option>
<option data-content="PICHINCHA / PEDRO VICENTE MALDONADO" value="c6a7458b-34b9-49b4-a28a-e85de0dbfb7c">PICHINCHA / PEDRO VICENTE MALDONADO</option>
<option data-content="PICHINCHA / PEDRO MONCAYO" value="8f79719a-f9a5-4d6a-9443-9749591fdd9d">PICHINCHA / PEDRO MONCAYO</option>
<option data-content="PICHINCHA / PUERTO QUITO" value="44237376-6272-469f-a8aa-e33d52f3527c">PICHINCHA / PUERTO QUITO</option>
<option data-content="SANTA ELENA / SALINAS" value="c120dfb9-1eb0-4425-ba44-5766c203593f">SANTA ELENA / SALINAS</option>
<option data-content="SANTA ELENA / SANTA ELENA" value="5265e711-f9cc-4a1e-aa92-e8e0b66d3dce">SANTA ELENA / SANTA ELENA</option>
<option data-content="SANTA ELENA / LIBERTAD" value="c1352844-b621-4283-ae23-dd2bdd6bdea2">SANTA ELENA / LIBERTAD</option>
<option data-content="SANTO DOMINGO / LA CONCORDIA" value="242b2928-679f-4e42-9817-5526bc28a0a7">SANTO DOMINGO / LA CONCORDIA</option>
<option data-content="SANTO DOMINGO / SANTO DOMINGO DE LOS TSACHILAS" value="4047889e-827d-4e3a-91ba-bb6e50554477">SANTO DOMINGO / SANTO DOMINGO DE LOS TSACHILAS</option>
<option data-content="SUCUMBIOS / CUYABENO" value="3a96d7b2-cdda-4ac0-86c8-c18e7d9a2f8f">SUCUMBIOS / CUYABENO</option>
<option data-content="SUCUMBIOS / SHUSHUFINDI" value="7f3948ff-caf4-4d2d-a6c7-94e2bd7b206f">SUCUMBIOS / SHUSHUFINDI</option>
<option data-content="SUCUMBIOS / PUTUMAYO" value="5ee2933b-5d49-4bdf-a27c-9e7339b9610b">SUCUMBIOS / PUTUMAYO</option>
<option data-content="SUCUMBIOS / CASCALES" value="8845a2bd-80a5-4d9f-bbf1-e415182349d8">SUCUMBIOS / CASCALES</option>
<option data-content="SUCUMBIOS / LAGO AGRIO" value="d49a645a-b5f1-4c88-a37a-0f4ee2842c16">SUCUMBIOS / LAGO AGRIO</option>
<option data-content="SUCUMBIOS / SUCUMBIOS" value="f2054f40-0646-47db-8e3d-f0eee4b6868a">SUCUMBIOS / SUCUMBIOS</option>
<option data-content="SUCUMBIOS / GONZALO PIZARRO" value="fa8ba247-f645-40d6-be19-8b76a3bea17b">SUCUMBIOS / GONZALO PIZARRO</option>
<option data-content="TUNGURAHUA / CEVALLOS" value="e5985062-b201-4f66-a901-8c91c55c15a3">TUNGURAHUA / CEVALLOS</option>
<option data-content="TUNGURAHUA / PATATE" value="2c0400e8-e9fb-46bc-9ddc-497e219924a7">TUNGURAHUA / PATATE</option>
<option data-content="TUNGURAHUA / AMBATO" value="7243c3f2-1d1c-4c1e-a383-a1a904399b95">TUNGURAHUA / AMBATO</option>
<option data-content="TUNGURAHUA / QUERO" value="c56ade91-faf4-4aa2-8cc8-633db00f0862">TUNGURAHUA / QUERO</option>
<option data-content="TUNGURAHUA / SANTIAGO DE PILLARO" value="a1381ab3-68d0-4b80-97c8-945e25ba4f97">TUNGURAHUA / SANTIAGO DE PILLARO</option>
<option data-content="TUNGURAHUA / BAÑOS" value="48e3e942-2e49-4ca0-8177-2bd45c6bd38c">TUNGURAHUA / BAÑOS</option>
<option data-content="TUNGURAHUA / TISALEO" value="292536cc-2edf-49d2-8466-2b17022c67e6">TUNGURAHUA / TISALEO</option>
<option data-content="TUNGURAHUA / MOCHA" value="80f56598-94de-40a5-a48e-dfc9986634cc">TUNGURAHUA / MOCHA</option>
<option data-content="TUNGURAHUA / SAN PEDRO DE PELILEO" value="20673ebc-8cd0-48ea-9549-ecafebc4770c">TUNGURAHUA / SAN PEDRO DE PELILEO</option>
<option data-content="ZAMORA CHINCHIPE / ZAMORA" value="5523c17b-c5f3-4545-a833-59eb04a8a2fc">ZAMORA CHINCHIPE / ZAMORA</option>
<option data-content="ZAMORA CHINCHIPE / YACUAMBI" value="dab1968c-feb5-4325-a73f-5e7b5df8895a">ZAMORA CHINCHIPE / YACUAMBI</option>
<option data-content="ZAMORA CHINCHIPE / EL PANGUI" value="4acdce92-8aad-4f49-a054-6dec473a807c">ZAMORA CHINCHIPE / EL PANGUI</option>
<option data-content="ZAMORA CHINCHIPE / CENTINELA DEL CONDOR" value="6574ee94-3b8a-4e91-a381-b72387664daf">ZAMORA CHINCHIPE / CENTINELA DEL CONDOR</option>
<option data-content="ZAMORA CHINCHIPE / YANTZAZA" value="e6f82e25-bcb5-457b-9094-6638189cc1a7">ZAMORA CHINCHIPE / YANTZAZA</option>
<option data-content="ZAMORA CHINCHIPE / PAQUISHA" value="6f853d20-686c-4a63-bcf7-428a9de5e5b9">ZAMORA CHINCHIPE / PAQUISHA</option>
<option data-content="ZAMORA CHINCHIPE / PALANDA" value="c515d008-fbbc-4434-b451-e259c0886a75">ZAMORA CHINCHIPE / PALANDA</option>
<option data-content="ZAMORA CHINCHIPE / CHINCHIPE" value="a2d9302a-0ea5-421d-abd5-54529c9c489f">ZAMORA CHINCHIPE / CHINCHIPE</option>
<option data-content="ZAMORA CHINCHIPE / NANGARITZA" value="d70aa9e5-997f-4090-8ebb-c710839af970">ZAMORA CHINCHIPE / NANGARITZA</option>
<option data-content="ZONAS NO DELIMITADAS / MANGA DEL CURA" value="e261863c-8cd8-4554-af9a-4bfe087a11a1">ZONAS NO DELIMITADAS / MANGA DEL CURA</option>
<option data-content="ZONAS NO DELIMITADAS / LAS GOLONDRINAS" value="5e1ec9db-ee76-462e-884e-de82968bc264">ZONAS NO DELIMITADAS / LAS GOLONDRINAS</option>
<option data-content="ZONAS NO DELIMITADAS / EL PIEDRERO" value="2c8344f4-ffbd-4005-8e62-489b6721c1d0">ZONAS NO DELIMITADAS / EL PIEDRERO</option>
\`;

const regex = /data-content="([^"]+)"/g;
let match;
const names = [];
while ((match = regex.exec(html)) !== null) {
  names.push(match[1]);
}

console.log(JSON.stringify(names, null, 2));
