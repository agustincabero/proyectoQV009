var connection = require('../lib/conexionbd');

function getMovie (req, res) {
  var sql = 'SELECT * FROM pelicula';
  var totalQuery = 'SELECT COUNT(*) AS total FROM pelicula';
  
  //FILTERS
  var filters = ` WHERE `
  if (req.query.titulo) filters += `titulo LIKE \'\%${req.query.titulo}\%\'`;
  
  if (req.query.anio) {
    if (req.query.titulo) filters += ` AND `
    filters += `anio = ${req.query.anio}`; 
  }

  if (req.query.genero) {
    if (req.query.titulo || req.query.anio) filters += ` AND `
    filters += `genero_id = ${req.query.genero}`; 
  } 
  
  if (filters != ` WHERE `){
    sql += filters;
    totalQuery += filters;
  }

  //Order by and Limit
  if (req.query.columna_orden === 'anio') {
    sql += ` ORDER BY fecha_lanzamiento ${req.query.tipo_orden}`;
  } else if (req.query.columna_orden === 'puntuacion') {
    sql += ` ORDER BY puntuacion ${req.query.tipo_orden}`;
  }

  //Paging
  sql += ` LIMIT ${((req.query.pagina - 1) * req.query.pagina) + 1},${req.query.cantidad}`;
  connection.query(sql, function(error, result) {
    if (error) {
      console.log("ERROR: ", error.message);
      return res.status(404).send(error.message)    
    }

    connection.query(totalQuery, function(error, totalCount) {
      if (error) {
        console.log("ERROR: ", error.message);
        return res.status(404).send(error.message)       
      }

      var response = {
        'peliculas': result,
        'total': totalCount[0].total
      };

      res.send(JSON.stringify(response));   
    });
  });
}

function getGenres(req, res) {
  var sql = 'SELECT * FROM genero;'

  connection.query(sql, function(error, result) {
    if (error) {
        console.log("Hubo un error en la consulta", error.message);
        return res.status(404).send("Hubo un error en la consulta");
    } 
    
    var response = {
        'generos': result
    };

    res.send(JSON.stringify(response));
  });
}

function getInfo (req, res) {

  var sql = `SELECT pelicula.id, titulo, duracion, director, anio, fecha_lanzamiento, puntuacion, poster, trama, genero.nombre as genero, actor.nombre FROM pelicula INNER JOIN genero ON pelicula.genero_id = genero.id INNER JOIN actor_pelicula ON pelicula.id = pelicula_id INNER JOIN actor ON actor.id = actor_id WHERE pelicula.id = ${req.params.id}`;

  connection.query(sql, function(error, result) {
    if (error) {
        console.log("Hubo un error en la consulta", error.message);
        return res.status(404).send("Hubo un error en la consulta");
    };

    var response = {
      pelicula: result[0],
      actores: result,
      genero: result[0].genero
    };
    
    res.send(JSON.stringify(response));  
  });
}

function getRecomm (req, res) {
  var sql = 'SELECT pelicula.id, titulo, trama, nombre, poster FROM pelicula INNER JOIN genero ON pelicula.genero_id = genero.id';

  //FILTERS
  var filters = ` WHERE `
  
  if (req.query.puntuacion) filters += `pelicula.puntuacion >= ${req.query.puntuacion}`;
  
  if (req.query.anio_inicio && req.query.anio_fin) {
    if (req.query.puntuacion) filters += ` AND `
    filters += `pelicula.anio BETWEEN ${req.query.anio_inicio} AND ${req.query.anio_fin}`;
  }

  if (req.query.genero){
    if (req.query.puntuacion || (req.query.anio_inicio && req.query.anio_fin)) filters += ` AND `
    filters += `genero.nombre = \'${req.query.genero}\'`;
  }

  if (filters != ` WHERE `){
    sql += filters;
  }

  connection.query(sql, function(error, result) {
    if (error) {
      console.log("ERROR: ", error.message);
      return res.status(404).send(error.message)    
    }

    var response = {
      'peliculas': result
    };

    res.send(JSON.stringify(response));    
  });
}

module.exports = {
  getMovie: getMovie,
  getGenres: getGenres,
  getInfo: getInfo,
  getRecomm: getRecomm
};
