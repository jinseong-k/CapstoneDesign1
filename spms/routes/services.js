var mysql = require('mysql');
var gcm = require('node-gcm');
require('date-utils');

var pool = mysql.createPool({
	host:'54.187.53.60',
	port:3306,
	user:'root',
	password:'root',
	database:'spms'
});


exports.test = function(req, res){
	pool.getConnection(function(err, connection){
		if(err){
			console.error('Connection error : ',err);
			res.statusCode = 503;
			res.send({
				resul:'error',
				err : err.code
			});
		}else{
			 connection.query('SELECT * FROM member', function(err, rows){
				connection.release();
				res.charset = "utf-8";
				res.json(rows);
			});
		 }
	});
};

exports.join = function(req, res){
	pool.getConnection(function(err,connection){
		connection.query('SELECT U_Id FROM member WHERE U_Id=?',[req.query.id],function(err, rows){
			connection.release();
			if(rows.length==1){
				res.send(200,'false');
			}else{
				connection.query('INSERT INTO member (U_Id,name,pwd) values (?,?,?)',[req.query.id,req.query.name,req.query.pwd],function(err, rows){
					connection.release();
					res.send(200,'true');
				});
			}
		});
	});
};

exports.login = function(req, res){
	pool.getConnection(function(err,connection){
		connection.query('SELECT U_Id FROM member where U_id=? and pwd=?',[req.query.id,req.query.pwd],function(err,rows){
			connection.release();
			if(rows.length==0){
				res.send(200,'false');
			}else{
				res.send(200,'true');
			}
		});
	});
};

exports.reg_plant = function(req, res){
	pool.getConnection(function(err,connection){
		connection.query('INSERT INTO plant_user(U_Id,P_Id) VALUES (?,?)',[req.query.id,req.query.p_id],function(err,rows){
			connection.release();
			if(rows==undefined){
				res.send(200,'false');
			}else{
				res.send(200,'true');
			}
		});
	});
};

exports.record_info = function(req, res){
	pool.getConnection(function(err, connection){
		var dt = new Date();
		var d = dt.toFormat('YYYY-MM-DD HH24:MI:SS');
		connection.query('SELECT count(*) cnt from plant_info where P_Id=?',[req.query.p_id],function(err, rows){
			var temp = rows[0].cnt;
			if(temp > 360){
				connection.query('delete from plant_info WHERE info_Id = (select info_Id from ( select * from plant_info WHERE P_Id = ? order by info_Id asc) a Limit 0,1); ',[req.query.p_id],function(err,rows){
					connection.release();
					console.log('delete a row');
				});
			}
		});
		connection.query('INSERT INTO plant_info(P_Id,time,temperature,humidity,illumination) VALUES (?,?,?,?,?)',[req.query.p_id, d, req.query.temp, req.query.humid, req.query.ill], function(err,rows){
			connection.release();
			if(rows==undefined){
				res.send(200,'false');
			}else{
				res.send(200,'true');
			}
		});
	});
};

exports.load_info = function(req, res){
	pool.getConnection(function(err, connection){
		connection.query('select * from (select * from plant_info where P_Id=2 order by info_id desc LIMIT 0,6) a order by info_id asc',[req.query.p_id],function(err, rows){
			connection.release();
			if(rows.length == 0){
				res.send(200,'false');
			}else{
				res.charset = "utf-8";
				res.json(rows);
			}
		});
	});
};

exports.myplant = function(req,res){
	pool.getConnection(function(err, connection){
		connection.query('SELECT p_id FROM plant_user WHERE U_Id = ?',[req.query.id],function(err, rows){
			connection.release();
			if(rows.length == 0){
				res.send(200,'false');
			}else{
				res.charset = "utf-8";
				res.json(rows);
			}
		});
	});
};

exports.setwater = function(req,res){
	pool.getConnection(function(err, connection){
		connection.query('UPDATE plant_user SET iswatering = 1 WHERE p_id = ?',[req.query.p_id],function(err, rows){
			connection.release();
			if(rows == undefined){
				res.send(200,'false');
			}else{
				res.send(200,'true');
			}
		});
	});
};

exports.iswater = function(req,res){
	pool.getConnection(function(err,connection){
		connection.query('SELECT iswatering FROM plant_user WHERE p_id = ?',[req.query.p_id],function(err,rows){
			connection.release();
			if(rows[0].iswatering == 1){
				res.send(200,'true');
				connection.query('UPDATE plant_user SET iswatering = 0 WHERE p_id = ?',[req.query.p_id],function(err,rows){
					connection.release();
				});
			}else{
				res.send(200,'false');
			}
		});
	});
};
