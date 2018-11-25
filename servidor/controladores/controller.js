var connection = require('../lib/conexionbd');

function getMovie (req, res) {
  var sql = 'SELECT * FROM pelicula';
  var totalQuery = 'SELECT COUNT(*) AS total FROM pelicula';
  var titulo = req.query.titulo;
  var anio = req.query.anio;
  var genero = req.query.genero;
  var orden =req.query.columna_orden; 
  var tipoOrden = req.query.tipo_orden;
  var pagina = req.query.pagina;
  var cantidad = req.query.cantidad;

  //FILTERS
  var filters = ` WHERE `
  if (titulo) filters += `titulo LIKE \'\%${titulo}\%\'`;
  
  if (anio) {
    if (titulo) filters += ` AND `
    filters += `anio = ${anio}`; 
  }

  if (genero) {
    if (titulo || anio) filters += ` AND `
    filters += `genero_id = ${genero}`; 
  } 
  
  if (filters != ` WHERE `){
    sql += filters;
    totalQuery += filters;
  }

  //Order by and Limit
  if (orden === 'anio') {
    sql += ` ORDER BY fecha_lanzamiento ${tipoOrden}`;
  } else if (orden === 'puntuacion') {
    sql += ` ORDER BY puntuacion ${tipoOrden}`;
  } else if (orden === 'duracion') {
    sql += ` ORDER BY duracion ${tipoOrden}`;
  }

  //Paging
  sql += ` LIMIT ${((pagina - 1) * cantidad) + 1},${cantidad}`;
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
  var id = req.params.id;

  var sql = `SELECT pelicula.id, titulo, duracion, director, anio, fecha_lanzamiento, puntuacion, poster, trama, genero.nombre as genero, actor.nombre FROM pelicula INNER JOIN genero ON pelicula.genero_id = genero.id INNER JOIN actor_pelicula ON pelicula.id = pelicula_id INNER JOIN actor ON actor.id = actor_id WHERE pelicula.id = ${id}`;

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

module.exports = {
  getMovie: getMovie,
  getGenres: getGenres,
  getInfo: getInfo
};
