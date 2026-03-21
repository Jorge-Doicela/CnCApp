/**
 * Nombres de cantón alineados al catálogo oficial (gad_municipios tipo CANTON).
 * Clave: provincia (texto en ecuador-data) + cantón interno, normalizados.
 */
export function normalizeGeoKey(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/\s+/g, ' ')
        .trim();
}

/** Mapa: `${normalize(prov)}|${normalize(cantonInterno)}` → nombre oficial exacto */
const CANTON_NOMBRE_OFICIAL: Record<string, string> = (() => {
    const m: Record<string, string> = {};
    const add = (prov: string, cant: string, oficial: string) => {
        m[`${normalizeGeoKey(prov)}|${normalizeGeoKey(cant)}`] = oficial;
    };

    // AZUAY
    add('AZUAY', 'CUENCA', 'CUENCA');
    add('AZUAY', 'GIRÓN', 'GIRÓN');
    add('AZUAY', 'GUALACEO', 'GUALACEO');
    add('AZUAY', 'NABÓN', 'NABÓN');
    add('AZUAY', 'PAUTE', 'PAUTE');
    add('AZUAY', 'PUCARA', 'PUCARÁ');
    add('AZUAY', 'SAN FERNANDO', 'SAN FERNANDO');
    add('AZUAY', 'SANTA ISABEL', 'SANTA ISABEL');
    add('AZUAY', 'SIGSIG', 'SÍGSIG');
    add('AZUAY', 'OÑA', 'OÑA');
    add('AZUAY', 'CHORDELEG', 'CHORDELEG');
    add('AZUAY', 'EL PAN', 'EL PAN');
    add('AZUAY', 'SEVILLA DE ORO', 'SEVILLA DE ORO');
    add('AZUAY', 'GUACHAPALA', 'GUACHAPALA');
    add('AZUAY', 'CAMILO PONCE ENRIQUEZ', 'CAMILO PONCE ENRÍQUEZ');

    // BOLÍVAR (ecuador-data usa "BOLIVAR")
    add('BOLIVAR', 'GUARANDA', 'GUARANDA');
    add('BOLIVAR', 'CHILLANES', 'CHILLANES');
    add('BOLIVAR', 'CHIMBO', 'CHIMBO');
    add('BOLIVAR', 'ECHEANDIA', 'ECHEANDÍA');
    add('BOLIVAR', 'SAN MIGUEL', 'SAN MIGUEL (BOLÍVAR)');
    add('BOLIVAR', 'CALUMA', 'CALUMA');
    add('BOLIVAR', 'LAS NAVES', 'LAS NAVES');

    // CAÑAR
    add('CAÑAR', 'AZOGUES', 'AZOGUES');
    add('CAÑAR', 'BIBLIAN', 'BIBLIÁN');
    add('CAÑAR', 'CAÑAR', 'CAÑAR (CAÑAR)');
    add('CAÑAR', 'LA TRONCAL', 'LA TRONCAL');
    add('CAÑAR', 'EL TAMBO', 'EL TAMBO (CAÑAR)');
    add('CAÑAR', 'DELEG', 'DÉLEG');
    add('CAÑAR', 'SUSCAL', 'SUSCAL');

    // CARCHI
    add('CARCHI', 'TULCAN', 'TULCÁN');
    add('CARCHI', 'BOLIVAR', 'BOLÍVAR (CARCHI)');
    add('CARCHI', 'ESPEJO', 'ESPEJO');
    add('CARCHI', 'MIRA', 'MIRA');
    add('CARCHI', 'MONTUFAR', 'MONTÚFAR');
    add('CARCHI', 'SAN PEDRO DE HUACA', 'SAN PEDRO DE HUACA');

    // COTOPAXI
    add('COTOPAXI', 'LATACUNGA', 'LATACUNGA');
    add('COTOPAXI', 'LA MANA', 'LA MANÁ');
    add('COTOPAXI', 'PANGUA', 'PANGUA');
    add('COTOPAXI', 'PUJILI', 'PUJILÍ');
    add('COTOPAXI', 'SALCEDO', 'SALCEDO');
    add('COTOPAXI', 'SAQUISILI', 'SAQUISILÍ');
    add('COTOPAXI', 'SIGCHOS', 'SIGCHOS');

    // CHIMBORAZO
    add('CHIMBORAZO', 'RIOBAMBA', 'RIOBAMBA');
    add('CHIMBORAZO', 'ALAUSI', 'ALAUSÍ');
    add('CHIMBORAZO', 'COLTA', 'COLTA');
    add('CHIMBORAZO', 'CHAMBO', 'CHAMBO');
    add('CHIMBORAZO', 'CHUNCHI', 'CHUNCHI');
    add('CHIMBORAZO', 'GUAMOTE', 'GUAMOTE');
    add('CHIMBORAZO', 'GUANO', 'GUANO');
    add('CHIMBORAZO', 'PALLATANGA', 'PALLATANGA');
    add('CHIMBORAZO', 'PENIPE', 'PENIPE');
    add('CHIMBORAZO', 'CUMANDA', 'CUMANDÁ');

    // EL ORO
    add('EL ORO', 'MACHALA', 'MACHALA');
    add('EL ORO', 'ARENILLAS', 'ARENILLAS');
    add('EL ORO', 'ATAHUALPA', 'ATAHUALPA');
    add('EL ORO', 'BALSAS', 'BALSAS');
    add('EL ORO', 'CHILLA', 'CHILLA');
    add('EL ORO', 'EL GUABO', 'EL GUABO');
    add('EL ORO', 'HUAQUILLAS', 'HUAQUILLAS');
    add('EL ORO', 'MARCABELI', 'MARCABELÍ');
    add('EL ORO', 'PASAJE', 'PASAJE');
    add('EL ORO', 'PIÑAS', 'PIÑAS');
    add('EL ORO', 'PORTOVELO', 'PORTOVELO');
    add('EL ORO', 'SANTA ROSA', 'SANTA ROSA (EL ORO)');
    add('EL ORO', 'ZARUMA', 'ZARUMA');
    add('EL ORO', 'LAS LAJAS', 'LAS LAJAS');

    // ESMERALDAS
    add('ESMERALDAS', 'ESMERALDAS', 'ESMERALDAS (ESMERALDAS)');
    add('ESMERALDAS', 'ELOY ALFARO', 'ELOY ALFARO (ESMERALDAS)');
    add('ESMERALDAS', 'MUISNE', 'MUISNE');
    add('ESMERALDAS', 'QUININDE', 'QUININDÉ');
    add('ESMERALDAS', 'SAN LORENZO', 'SAN LORENZO');
    add('ESMERALDAS', 'ATACAMES', 'ATACAMES');
    add('ESMERALDAS', 'RIOVERDE', 'RIOVERDE');

    // GUAYAS
    add('GUAYAS', 'GUAYAQUIL', 'GUAYAQUIL');
    add('GUAYAS', 'ALFREDO BAQUERIZO MORENO (JUJAN)', 'ALFREDO BAQUERIZO MORENO (JUJÁN)');
    add('GUAYAS', 'BALAO', 'BALAO');
    add('GUAYAS', 'BALZAR', 'BALZAR');
    add('GUAYAS', 'COLIMES', 'COLIMES');
    add('GUAYAS', 'DAULE', 'DAULE (GUAYAS)');
    add('GUAYAS', 'DURAN', 'DURÁN');
    add('GUAYAS', 'EL EMPALME', 'EL EMPALME');
    add('GUAYAS', 'EL TRIUNFO', 'EL TRIUNFO');
    add('GUAYAS', 'MILAGRO', 'MILAGRO (GUAYAS)');
    add('GUAYAS', 'NARANJAL', 'NARANJAL');
    add('GUAYAS', 'NARANJITO', 'NARANJITO');
    add('GUAYAS', 'PALESTINA', 'PALESTINA');
    add('GUAYAS', 'PEDRO CARBO', 'PEDRO CARBO');
    add('GUAYAS', 'SALITRE (URBINA JADO)', 'SALITRE');
    add('GUAYAS', 'SAMBORONDON', 'SAMBORONDÓN');
    add('GUAYAS', 'SANTA LUCIA', 'SANTA LUCÍA');
    add('GUAYAS', 'URBINA JADO (SALITRE)', 'SALITRE');
    add('GUAYAS', 'YAGUACHI', 'SAN JACINTO DE YAGUACHI');
    add('GUAYAS', 'PLAYAS', 'PLAYAS');
    add('GUAYAS', 'SIMON BOLIVAR', 'SIMÓN BOLÍVAR');
    add('GUAYAS', 'CORONEL MARCELINO MARIDUEÑA', 'CORONEL MARCELINO MARIDUEÑA');
    add('GUAYAS', 'LOMAS DE SARGENTILLO', 'LOMAS DE SARGENTILLO');
    add('GUAYAS', 'NOBOL', 'NOBOL');
    add('GUAYAS', 'GENERAL ANTONIO ELIZALDE (BUCAY)', 'GENERAL ANTONIO ELIZALDE');
    add('GUAYAS', 'ISIDRO AYORA', 'ISIDRO AYORA');

    // IMBABURA
    add('IMBABURA', 'IBARRA', 'IBARRA');
    add('IMBABURA', 'ANTONIO ANTE', 'ANTONIO ANTE');
    add('IMBABURA', 'COTACACHI', 'COTACACHI');
    add('IMBABURA', 'OTAVALO', 'OTAVALO');
    add('IMBABURA', 'PIMAMPIRO', 'PIMAMPIRO');
    add('IMBABURA', 'SAN MIGUEL DE URCUQUI', 'SAN MIGUEL DE URCUQUÍ');

    // LOJA
    add('LOJA', 'LOJA', 'LOJA (LOJA)');
    add('LOJA', 'CALVAS', 'CALVAS');
    add('LOJA', 'CATAMAYO', 'CATAMAYO');
    add('LOJA', 'CELICA', 'CELICA');
    add('LOJA', 'CHAGUARPAMBA', 'CHAGUARPAMBA');
    add('LOJA', 'ESPINDOLA', 'ESPÍNDOLA');
    add('LOJA', 'GONZANAMA', 'GONZANAMÁ');
    add('LOJA', 'MACARA', 'MACARÁ');
    add('LOJA', 'PALTAS', 'PALTAS');
    add('LOJA', 'PUYANGO', 'PUYANGO');
    add('LOJA', 'SARAGURO', 'SARAGURO');
    add('LOJA', 'SOZORANGA', 'SOZORANGA');
    add('LOJA', 'ZAPOTILLO', 'ZAPOTILLO');
    add('LOJA', 'PINDAL', 'PINDAL');
    add('LOJA', 'QUILANGA', 'QUILANGA');
    add('LOJA', 'OLMEDO', 'OLMEDO (LOJA)');

    // LOS RIOS
    add('LOS RIOS', 'BABAHOYO', 'BABAHOYO');
    add('LOS RIOS', 'BABA', 'BABA');
    add('LOS RIOS', 'MONTALVO', 'MONTALVO');
    add('LOS RIOS', 'PUEBLOVIEJO', 'PUEBLOVIEJO');
    add('LOS RIOS', 'QUEVEDO', 'QUEVEDO');
    add('LOS RIOS', 'URDANETA', 'URDANETA (LOS RÍOS)');
    add('LOS RIOS', 'VENTANAS', 'VENTANAS');
    add('LOS RIOS', 'VINCES', 'VINCES');
    add('LOS RIOS', 'PALENQUE', 'PALENQUE');
    add('LOS RIOS', 'BUENA FE', 'BUENA FE');
    add('LOS RIOS', 'VALENCIA', 'VALENCIA');
    add('LOS RIOS', 'MOCACHE', 'MOCACHE');
    add('LOS RIOS', 'QUINSALOMA', 'QUINSALOMA');

    // MANABI
    add('MANABI', 'PORTOVIEJO', 'PORTOVIEJO');
    add('MANABI', 'BOLIVAR', 'BOLÍVAR (MANABÍ)');
    add('MANABI', 'CHONE', 'CHONE');
    add('MANABI', 'EL CARMEN', 'EL CARMEN');
    add('MANABI', 'FLAVIO ALFARO', 'FLAVIO ALFARO');
    add('MANABI', 'JIPIJAPA', 'JIPIJAPA');
    add('MANABI', 'JUNIN', 'JUNÍN');
    add('MANABI', 'MANTA', 'MANTA');
    add('MANABI', 'MONTECRISTI', 'MONTECRISTI');
    add('MANABI', 'PAJAN', 'PAJÁN');
    add('MANABI', 'PICHINCHA', 'PICHINCHA (MANABÍ)');
    add('MANABI', 'ROCAFUERTE', 'ROCAFUERTE');
    add('MANABI', 'SANTA ANA', 'SANTA ANA');
    add('MANABI', 'SUCRE', 'SUCRE (MANABÍ)');
    add('MANABI', 'TOSAGUA', 'TOSAGUA');
    add('MANABI', '24 DE MAYO', '24 DE MAYO');
    add('MANABI', 'PEDERNALES', 'PEDERNALES');
    add('MANABI', 'OLMEDO', 'OLMEDO (MANABÍ)');
    add('MANABI', 'PUERTO LOPEZ', 'PUERTO LÓPEZ');
    add('MANABI', 'JAMA', 'JAMA');
    add('MANABI', 'JARAMIJO', 'JARAMIJÓ');
    add('MANABI', 'SAN VICENTE', 'SAN VICENTE');

    // MORONA SANTIAGO
    add('MORONA SANTIAGO', 'MORONA', 'MORONA');
    add('MORONA SANTIAGO', 'GUALAQUIZA', 'GUALAQUIZA');
    add('MORONA SANTIAGO', 'LIMON INDANZA', 'LIMÓN INDANZA');
    add('MORONA SANTIAGO', 'PALORA', 'PALORA');
    add('MORONA SANTIAGO', 'SANTIAGO', 'SANTIAGO (MORONA SANTIAGO)');
    add('MORONA SANTIAGO', 'SUCUA', 'SUCÚA');
    add('MORONA SANTIAGO', 'HUAMBOYA', 'HUAMBOYA');
    add('MORONA SANTIAGO', 'SAN JUAN BOSCO', 'SAN JUAN BOSCO');
    add('MORONA SANTIAGO', 'TAISHA', 'TAISHA');
    add('MORONA SANTIAGO', 'LOGROÑO', 'LOGROÑO');
    add('MORONA SANTIAGO', 'PABLO SEXTO', 'PABLO SEXTO');
    add('MORONA SANTIAGO', 'TIWINTZA', 'TIWINTZA');

    // NAPO
    add('NAPO', 'TENA', 'TENA');
    add('NAPO', 'ARCHIDONA', 'ARCHIDONA');
    add('NAPO', 'EL CHACO', 'EL CHACO');
    add('NAPO', 'QUIJOS', 'QUIJOS');
    add('NAPO', 'CARLOS JULIO AROSEMENA TOLA', 'CARLOS JULIO AROSEMENA TOLA');

    // PASTAZA
    add('PASTAZA', 'PASTAZA', 'PASTAZA (PASTAZA)');
    add('PASTAZA', 'MERA', 'MERA');
    add('PASTAZA', 'SANTA CLARA', 'SANTA CLARA');
    add('PASTAZA', 'ARAJUNO', 'ARAJUNO');

    // PICHINCHA
    add('PICHINCHA', 'QUITO', 'DISTRITO METROPOLITANO DE QUITO');
    add('PICHINCHA', 'CAYAMBE', 'CAYAMBE');
    add('PICHINCHA', 'MEJIA', 'MEJÍA');
    add('PICHINCHA', 'PEDRO MONCAYO', 'PEDRO MONCAYO');
    add('PICHINCHA', 'RUMIÑAHUI', 'RUMIÑAHUI');
    add('PICHINCHA', 'SAN MIGUEL DE LOS BANCOS', 'SAN MIGUEL DE LOS BANCOS');
    add('PICHINCHA', 'PEDRO VICENTE MALDONADO', 'PEDRO VICENTE MALDONADO');
    add('PICHINCHA', 'PUERTO QUITO', 'PUERTO QUITO');

    // TUNGURAHUA
    add('TUNGURAHUA', 'AMBATO', 'AMBATO');
    add('TUNGURAHUA', 'BAÑOS DE AGUA SANTA', 'BAÑOS DE AGUA SANTA');
    add('TUNGURAHUA', 'CEVALLOS', 'CEVALLOS');
    add('TUNGURAHUA', 'MOCHA', 'MOCHA');
    add('TUNGURAHUA', 'PATATE', 'PATATE');
    add('TUNGURAHUA', 'QUERO', 'QUERO');
    add('TUNGURAHUA', 'SAN PEDRO DE PELILEO', 'SAN PEDRO DE PELILEO');
    add('TUNGURAHUA', 'SANTIAGO DE PILLARO', 'SANTIAGO DE PÍLLARO');
    add('TUNGURAHUA', 'TISALEO', 'TISALEO');

    // ZAMORA CHINCHIPE
    add('ZAMORA CHINCHIPE', 'ZAMORA', 'ZAMORA');
    add('ZAMORA CHINCHIPE', 'CHINCHIPE', 'CHINCHIPE');
    add('ZAMORA CHINCHIPE', 'NANGERITZA', 'NANGARITZA');
    add('ZAMORA CHINCHIPE', 'YACUAMBI', 'YACUAMBI');
    add('ZAMORA CHINCHIPE', 'YANTZAZA', 'YANTZAZA');
    add('ZAMORA CHINCHIPE', 'EL PANGUI', 'EL PANGUI');
    add('ZAMORA CHINCHIPE', 'CENTINELA DEL CONDOR', 'CENTINELA DEL CÓNDOR');
    add('ZAMORA CHINCHIPE', 'PALANDA', 'PALANDA');
    add('ZAMORA CHINCHIPE', 'PAQUISHA', 'PAQUISHA');

    // SUCUMBIOS
    add('SUCUMBIOS', 'LAGO AGRIO', 'LAGO AGRIO');
    add('SUCUMBIOS', 'GONZALO PIZARRO', 'GONZALO PIZARRO');
    add('SUCUMBIOS', 'PUTUMAYO', 'PUTUMAYO');
    add('SUCUMBIOS', 'SHUSHUFINDI', 'SHUSHUFINDI');
    add('SUCUMBIOS', 'SUCUMBIOS', 'SUCUMBÍOS (SUCUMBÍOS)');
    add('SUCUMBIOS', 'CASCALES', 'CASCALES');
    add('SUCUMBIOS', 'CUYABENO', 'CUYABENO');

    // ORELLANA
    add('ORELLANA', 'ORELLANA', 'FRANCISCO DE ORELLANA');
    add('ORELLANA', 'AGUARICO', 'AGUARICO');
    add('ORELLANA', 'LA JOYA DE LOS SACHAS', 'LA JOYA DE LOS SACHAS');
    add('ORELLANA', 'LORETO', 'LORETO');

    // SANTO DOMINGO DE LOS TSÁCHILAS (ecuador-data sin tilde en TSACHILAS)
    add('SANTO DOMINGO DE LOS TSACHILAS', 'SANTO DOMINGO', 'SANTO DOMINGO');
    add('SANTO DOMINGO DE LOS TSACHILAS', 'LA CONCORDIA', 'LA CONCORDIA');

    // SANTA ELENA
    add('SANTA ELENA', 'SANTA ELENA', 'SANTA ELENA (SANTA ELENA)');
    add('SANTA ELENA', 'LA LIBERTAD', 'LA LIBERTAD (SANTA ELENA)');
    add('SANTA ELENA', 'SALINAS', 'SALINAS (SANTA ELENA)');

    return m;
})();

export function resolverNombreCantonOficial(provinciaEcuadorData: string, nombreCantonInterno: string): string {
    const key = `${normalizeGeoKey(provinciaEcuadorData)}|${normalizeGeoKey(nombreCantonInterno)}`;
    return CANTON_NOMBRE_OFICIAL[key] ?? nombreCantonInterno;
}
