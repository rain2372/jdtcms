var settings = require('../settings');
var mysql = require('../models/db');
var User = require('../models/user');
var Settings = require('../models/settings');
var Post = require('../models/post');
var WxUser = require('../models/wx_user');
var WxRecord = require('../models/wx_record');
var async = require('async');
var debug = require('debug')('myapp:index');
var ejsExcel = require("./ejsExcel");
var fs = require("fs");
var formidable = require('formidable');
var request = require("request");
var crypto = require("crypto");
var Jdtuser = require('../models/jdtuser');
var Redpacket = require('../models/redpacket');
var Iconv = require('iconv-lite');
var Modeluser = require('../models/modeluser');

exports.userdo = function(req, res) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	var user = new User(req.params.sql, req, res);
}

exports.redpacketdo = function(req, res) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	var redpacket = new Redpacket(req.params.sql, req, res);
}

exports.jdtuserdo = function(req, res) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	var jdtuser = new Jdtuser(req.params.sql, req, res);
}

exports.modeluserdo = function(req, res) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	var modeluser = new Modeluser(req.params.sql, req, res);
}

exports.wx_userdo = function(req, res) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	var wx_user = new WxUser(req.params.sql, req, res);
}

exports.postdo = function(req, res) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	var post = new Post(req.params.sql, req, res);
}

exports.wx_recorddo = function(req, res) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	var wx_record = new WxRecord(req.params.sql, req, res);
}

exports.settingsdo = function(req, res) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	var settings = new Settings(req.params.sql, req, res);
}

function GetDateStr(time, AddDayCount) {
	var dd = time;
	dd.setDate(dd.getDate() + AddDayCount); //获取AddDayCount天后的日期 
	var y = dd.getFullYear();
	//var m = dd.getMonth()+1;//获取当前月份的日期 
	//var d = dd.getDate(); 
	var m = (((dd.getMonth() + 1) + "").length == 1) ? "0" + (dd.getMonth() + 1) : (dd.getMonth() + 1);
	var d = (((dd.getDate()) + "").length == 1) ? "0" + (dd.getDate()) : (dd.getDate());
	var hh = dd.getHours();
	var mm = dd.getMinutes();
	var ss = dd.getSeconds();
	console.log(y + "-" + m + "-" + d + " " + hh + ":" + mm + ":" + ss);
	return y + "-" + m + "-" + d + " " + hh + ":" + mm + ":" + ss;
}

exports.getopenid = function(req, res) {
	var code = req.query.code;
	var id = req.query.id;
	var appId = settings.AppID;
	var appSecret = settings.AppSecret;
	var url = "https://api.weixin.qq.com/sns/oauth2/access_token?grant_type=authorization_code&appid=" + appId + "&secret=" + appSecret + "&code=" + code;
	request(url, function(err, response, body) {
		if (!err && response.statusCode == 200) {
			if (JSON.parse(body).errcode != null) {
				console.log(body);
				res.redirect(req.url);
				return false;
			}
			console.log(body);
			var openid = JSON.parse(body).openid;
			var sql = "select id from wx_user_record where type_id = 3 and wx_openid = '" + openid + "' and post_id = " + id;
			mysql.query(sql, function(err, rows) {
				if (err) return console.error(err.stack);
				if (!rows[0]) {
					/*记录用户阅读行为*/
					setLog("insert into wx_user_record(wx_openid,operation_time,type_id,remark,post_id) values('" + openid + "',now(),3,''," + id + ")");
					/*获取系统设定*/
					var sql_settings = "select * from settings";
					mysql.query(sql_settings, function(err, settings) {
						if (err) return console.error(err.stack);
						/*记录微信用户积分行为*/
						var sql_score = "insert into wx_user_score(wx_openid,time,score,type_id,post_id) values('" + openid + "',now()," + settings[0].score_read + ",3," + id + ")";
						setLog(sql_score);
						/*给用户增加积分*/
						var sql_wx_user = "update wx_user set score_unused = score_unused + " + settings[0].score_read + ",score_total = score_total + " + settings[0].score_read + " where openid = '" + openid + "'";
						setLog(sql_wx_user);
						/*给用户的建定通账户增加使用天数*/
						var sql_admin = "select * from admin where username ='" + openid + "'";
						mysql.query(sql_admin, function(err, admin) {
							if (err) return console.error(err.stack);
							if (admin[0]) {
								var d = admin[0].limited + "";
								var limited = GetDateStr(new Date(d), settings[0].day_read);
								var sql_adday = "update admin set limited = '" + limited + "' where username ='" + openid + "'";
								setLog(sql_adday);
							}
						});
					});
					/*文章的阅读数+1*/
					var sql2 = "update post set read_count = read_count + 1 where id = " + id;
					mysql.query(sql2, function(err, rows) {
						if (err) return console.error(err.stack);
					});
				}
				res.redirect(settings.hosts + "/weixin_js?id=" + id + "&openid=" + openid);
			});
		}
	});
}

var strat_time = new Date();

exports.regsuccess = function(req, res) {
	res.render("regsuccess");
}

exports.WXProMatDetail = function(req, res) {
	var id = req.query.id;
	console.log("http://www.jdjs.com.cn/jdtcms/getWXProMatDetail.asp?p=select * from dbo.pro_mat_view where id = "+id);
	async.waterfall([function(callback) {
		request({
			encoding: null,
			url: "http://www.jdjs.com.cn/jdtcms/getWXProMatDetail.asp?p=select * from dbo.pro_mat_view where id = "+id
		}, function(error, res, body) {
			if (!error && res.statusCode == 200) {
				var body_zh1 = (Iconv.decode(body, 'utf-8').toString());
				console.log(body_zh1);
				var arr = body_zh1.split("@");
				var o1 = {
					id:id
				};
				o1.matname = arr[0];
				o1.ptime = arr[1];
				o1.proname = arr[2];
				o1.proid = arr[3];
				o1.matunit = arr[4];
				o1.matrek = arr[5];
				o1.stime = arr[6];
				o1.ftime = arr[7];
				o1.gycompany = arr[8];
				o1.linkname = arr[9];
				o1.pepid = arr[10];
				o1.company = arr[11];
				o1.pcid = arr[12];
				callback(null, o1);
			}
		});
	}], function(err, o1) {
		if (err) {
			console.log(err);
		} else {
			//console.log(str);
			res.render("WXProMatDetail",{
				baseinfo:o1
			});
		}
	});
}

exports.WXProDetail = function(req, res) {
	var id = req.query.id;
	async.waterfall([function(callback) {
		request({
			encoding: null,
			url: "http://www.jdjs.com.cn/jdtcms/getProBaseDetail.asp?p=select * from dbo.project_inforbase where id = "+id
		}, function(error, res, body) {
			if (!error && res.statusCode == 200) {
				var body_zh1 = (Iconv.decode(body, 'utf-8').toString());
				console.log(body_zh1);
				var arr = body_zh1.split("@");
				var o1 = {
					id:id
				};
				o1.proname = arr[0];
				o1.prosort = arr[4];
				o1.prostate = arr[5];
				o1.proplace = arr[1];
				o1.proaddress = arr[2];
				o1.prostime = arr[7];
				o1.proftime = arr[8];
				o1.promoney = arr[3];
				o1.prorek = arr[6];
				o1.inforptime = arr[9];
				callback(null, o1);
			}
		});
	}, function(o1,callback) {
		request({
			encoding: null,
			url: "http://www.jdjs.com.cn/jdtcms/getProBaseDetail_down.asp?p=select * from dbo.Pro_linkman_View where proid = "+id
		}, function(error, res, body) {
			if (!error && res.statusCode == 200) {
				var body_zh2 = (Iconv.decode(body, 'utf-8').toString());
				console.log(body_zh2);
				var str = '[';
				var arr1 = body_zh2.split("*");
				for (var i = 0; i < arr1.length; i++) {
					var arr2 = arr1[i].split("@");
					if (i == 0) {
						str += '{"companyname":"' + arr2[0] + '","cid":"' + arr2[1] + '","linkman":"' + arr2[2] + '","pepid":"' + arr2[3] + '","job":"' + arr2[4] + '","phone":"' + arr2[5] + '","fax":"' + arr2[6] + '","email":"' + arr2[7] + '","address":"' + arr2[8] + '","compid":"' + arr2[9] + '"}';
					} else {
						str += ',{"companyname":"' + arr2[0] + '","cid":"' + arr2[1] + '","linkman":"' + arr2[2] + '","pepid":"' + arr2[3] + '","job":"' + arr2[4] + '","phone":"' + arr2[5] + '","fax":"' + arr2[6] + '","email":"' + arr2[7] + '","address":"' + arr2[8] + '","compid":"' + arr2[9] + '"}';
					}
				}
				str += ']';
				callback(null, o1 ,JSON.parse(str));
			}
		});
	}], function(err, o1 ,str) {
		if (err) {
			console.log(err);
		} else {
			//console.log(str);
			res.render("WXProDetail",{
				baseinfo:o1,
				record:str
			});
		}
	});
}

exports.WXcompany = function(req, res) {
	var id = req.query.id;
	console.log("http://www.jdjs.com.cn/jdtcms/getWXcompany.asp?p=select * from dbo.TCcompany where pcid = "+id);
	async.waterfall([function(callback) {
		request({
			encoding: null,
			url: "http://www.jdjs.com.cn/jdtcms/getWXcompany.asp?p=select * from dbo.TCcompany where pcid = "+id
		}, function(error, res, body) {
			if (!error && res.statusCode == 200) {
				var body_zh1 = (Iconv.decode(body, 'utf-8').toString());
				console.log(body_zh1);
				var arr = body_zh1.split("@");
				var o1 = {
					id:id
				};
				
				o1.company = arr[0];
				o1.ctype = arr[1];
				o1.cplace = arr[2];
				o1.caddress = arr[3];
				o1.cpost = arr[4];
				o1.cphone = arr[5];
				o1.cfax = arr[6];
				o1.cemail = arr[7];
				o1.cweb = arr[8];
				callback(null, o1);
			}
		});
	}, function(o1,callback) {
		request({
			encoding: null,
			url: "http://www.jdjs.com.cn/jdtcms/getWXContactinfo_down.asp?p=select * from dbo.Pro_linkman_View where cid = "+id
		}, function(error, res, body) {
			if (!error && res.statusCode == 200) {
				var body_zh2 = (Iconv.decode(body, 'utf-8').toString());
				console.log(body_zh2);
				var str = '[';
				var arr1 = body_zh2.split("*");
				for (var i = 0; i < arr1.length; i++) {
					var arr2 = arr1[i].split("@");
					if (i == 0) {
						str += '{"proname":"' + arr2[0] + '","inforptime":"' + arr2[1] + '","prostate":"' + arr2[2] + '","proid":"' + arr2[3] + '"}';
					} else {
						str += ',{"proname":"' + arr2[0] + '","inforptime":"' + arr2[1] + '","prostate":"' + arr2[2] + '","proid":"' + arr2[3] + '"}';
					}
				}
				str += ']';
				callback(null, o1 ,JSON.parse(str));
			}
		});
	}, function(o1,str,callback) {
		request({
			encoding: null,
			url: "http://www.jdjs.com.cn/jdtcms/getWXcompany_down.asp?p=select * from dbo.TClinkman where cid = "+id
		}, function(error, res, body) {
			if (!error && res.statusCode == 200) {
				var body_zh3 = (Iconv.decode(body, 'utf-8').toString());
				console.log(body_zh3);
				var str1 = '[';
				var arr1 = body_zh3.split("*");
				for (var i = 0; i < arr1.length; i++) {
					var arr2 = arr1[i].split("@");
					if (i == 0) {
						str1 += '{"linkman":"' + arr2[0] + '","chenghu":"' + arr2[1] + '","job":"' + arr2[2] + '","phone":"' + arr2[3] + '","address":"' + arr2[4] + '","id":"' + arr2[5] + '"}';
					} else {
						str1 += ',{"linkman":"' + arr2[0] + '","chenghu":"' + arr2[1] + '","job":"' + arr2[2] + '","phone":"' + arr2[3] + '","address":"' + arr2[4] + '","id":"' + arr2[5] + '"}';
					}
				}
				str1 += ']';
				callback(null, o1 ,str ,JSON.parse(str1));
			}
		});
	}], function(err, o1 ,str,str1) {
		if (err) {
			console.log(err);
		} else {
			//console.log(str1);
			res.render("WXcompany",{
				baseinfo:o1,
				record:str,
				r:str1
			});
		}
	});
}

exports.WXContactinfo = function(req, res) {
	var id = req.query.id;
	console.log("http://www.jdjs.com.cn/jdtcms/getWXContactinfo.asp?p=select * from dbo.TClinkman where id = "+id);
	async.waterfall([function(callback) {
		request({
			encoding: null,
			url: "http://www.jdjs.com.cn/jdtcms/getWXContactinfo.asp?p=select * from dbo.TClinkman where id = "+id
		}, function(error, res, body) {
			if (!error && res.statusCode == 200) {
				var body_zh1 = (Iconv.decode(body, 'utf-8').toString());
				console.log(body_zh1);
				var arr = body_zh1.split("@");
				var o1 = {
					id:id
				};
				
				o1.linkman = arr[0];
				o1.chenghu = arr[1];
				o1.companyname = arr[3];
				o1.place = arr[4];
				o1.job = arr[2];
				o1.phone = arr[6];
				o1.fax = arr[7];
				o1.email = arr[8];
				o1.address = arr[5];
				o1.cid = arr[9];
				callback(null, o1);
			}
		});
	}, function(o1,callback) {
		request({
			encoding: null,
			url: "http://www.jdjs.com.cn/jdtcms/getWXContactinfo_down.asp?p=select * from dbo.Pro_linkman_View where pepid = "+id
		}, function(error, res, body) {
			if (!error && res.statusCode == 200) {
				var body_zh2 = (Iconv.decode(body, 'utf-8').toString());
				console.log(body_zh2);
				var str = '[';
				var arr1 = body_zh2.split("*");
				for (var i = 0; i < arr1.length; i++) {
					var arr2 = arr1[i].split("@");
					if (i == 0) {
						str += '{"proname":"' + arr2[0] + '","inforptime":"' + arr2[1] + '","prostate":"' + arr2[2] + '","proid":"' + arr2[3] + '"}';
					} else {
						str += ',{"proname":"' + arr2[0] + '","inforptime":"' + arr2[1] + '","prostate":"' + arr2[2] + '","proid":"' + arr2[3] + '"}';
					}
				}
				str += ']';
				callback(null, o1 ,JSON.parse(str));
			}
		});
	}], function(err, o1 ,str) {
		if (err) {
			console.log(err);
		} else {
			//console.log(str);
			res.render("WXContactinfo",{
				baseinfo:o1,
				record:str
			});
		}
	});
}

exports.WXprobase = function(req, res) {
	var proname = req.query.proname;
	var prosort = req.query.prosort;
	var proplace = req.query.proplace;
	
	var prostate = req.query.prostate;
	var proaddress = req.query.proaddress;
	var start_time1 = req.query.start_time1;
	var end_time1 = req.query.end_time1;
	var start_time2 = req.query.start_time2;
	var end_time2 = req.query.end_time2;
	var start_time3 = req.query.start_time3;
	var end_time3 = req.query.end_time3;
	var promoney1 = req.query.promoney1;
	var promoney2 = req.query.promoney2;
	var prorek = req.query.prorek;
	
	var page = parseInt(req.param("p"));
	
	var LIMIT = 20;
	page = (page && page > 0) ? page : 1;
	var limit = (limit && limit > 0) ? limit : LIMIT;
	var id_min = (page - 1) * limit;
	var id_max = id_min + LIMIT;
	//查询条件
	proname = proname?proname:"";
	prosort = prosort?prosort:"全部信息";
	proplace = proplace?proplace:"全部地区";
	
	prostate = prostate?prostate:"";
	proaddress = proaddress?proaddress:"";
	start_time1 = start_time1?start_time1:"";
	end_time1 = end_time1?end_time1:"";
	start_time2 = start_time2?start_time2:"";
	end_time2 = end_time2?end_time2:"";
	start_time3 = start_time3?start_time3:"";
	end_time3 = end_time3?end_time3:"";
	promoney1 = promoney1?promoney1:"";
	promoney2 = promoney2?promoney2:"";
	prorek = prorek?prorek:"";
	
	var change = "";
	if(proname != ""){
		change += " and proname like '@"+proname+"@'";
	}
	if(prosort != "全部信息"){
		change += " and prosort like '@"+prosort+"@'";
	}
	if(proplace != "全部地区"){
		change += " and proplace = '"+proplace+"'";
	}
	
	if(prostate != ""){
		change += " and prostate like '@"+prostate+"@'";
	}
	if(proaddress != ""){
		change += " and proaddress like '@"+proaddress+"@'";
	}
	if(start_time1 != ""){
		change += " and inforptime >= '"+start_time1+"'";
	}
	if(end_time1 != ""){
		change += " and inforptime <= '"+GetDateStr_end(end_time1,1)+"'";
	}
	if(start_time2 != ""){
		change += " and prostime >= '"+start_time2+"'";
	}
	if(end_time2 != ""){
		change += " and prostime <= '"+GetDateStr_end(end_time2,1)+"'";
	}
	if(start_time3 != ""){
		change += " and proftime >= '"+start_time3+"'";
	}
	if(end_time3 != ""){
		change += " and proftime <= '"+GetDateStr_end(end_time3,1)+"'";
	}
	
	if(prorek != ""){
		change += " and prorek like '@"+prorek+"@'";
	}
	
	if(promoney1 != ""){
		change += " and promoney >= "+promoney1;
	}
	
	if(promoney2 != ""){
		change += " and promoney <= "+promoney2;
	}
	
	
	var sql1 = "select top " + limit + " * from dbo.project_inforbase where id not in ( select top " + id_min + " id from dbo.project_inforbase order by id desc) "+change+" order by id desc";
	var sql2 = "select count(*) as count from dbo.project_inforbase where 1=1 "+change;
	console.log(sql1);console.log(sql2);
	async.waterfall([function(callback) {
		request({
			encoding: null,
			url: "http://www.jdjs.com.cn/jdtcms/WXprobase.asp?p=" + sql1
		}, function(error, res, body) {
			if (!error && res.statusCode == 200) {
				var body_zh = (Iconv.decode(body, 'utf-8').toString());
				console.log(body_zh);
				callback(null, (body_zh));
			}
		});
	}, function(result, callback) {
		request("http://www.jdjs.com.cn/jdtcms/getCount.asp?p=" + sql2, function(error, response, body) {
			if (!error && response.statusCode == 200) {
				//输出返回的内容
				//console.log(body);
				callback(null, result, body);
			}
		});
	}], function(err, rows, result) {
		if (err) {
			console.log(err);
		} else {
			rows = rows.replace(/"/g, "“");
			var str = '[';
			var arr1 = rows.split("*");
			for (var i = 0; i < arr1.length; i++) {
				var arr2 = arr1[i].split("@");
				if (i == 0) {
					str += '{"proname":"' + arr2[0] + '","prostate":"' + arr2[1] + '","inforptime":"' + arr2[2] + '","id":"' + arr2[3] + '"}';
				} else {
					str += ',{"proname":"' + arr2[0] + '","prostate":"' + arr2[1] + '","inforptime":"' + arr2[2] + '","id":"' + arr2[3] + '"}';
				}
			}
			str += ']';

			var total = result;

			var totalpage = Math.ceil(total / limit);
			var isFirstPage = page == 1;
			var isLastPage = ((page - 1) * limit + result.length) == total;
			console.log(start_time1);
			res.render("WXprobase",{
				record:JSON.parse(str),
				page: page,
				total: total,
				totalpage: totalpage,
				isFirstPage: isFirstPage,
				isLastPage: isLastPage,
				proname:proname,
				prosort:prosort,
				proplace:proplace,
				prostate:prostate,
				proaddress:proaddress,
				start_time1:start_time1,
				end_time1:end_time1,
				start_time2:start_time2,
				end_time2:end_time2,
				start_time3:start_time3,
				end_time3:end_time3,
				promoney1:promoney1,
				promoney2:promoney2,
				prorek:prorek
			});
		}
	});
	
}

exports.WXContactBase = function(req, res) {
	var linkman = req.query.linkman;
	var companyname = req.query.companyname;
	var job = req.query.job;
	var place = req.query.place;
	var address = req.query.address;
	var page = parseInt(req.param("p"));
	var LIMIT = 20;
	page = (page && page > 0) ? page : 1;
	var limit = (limit && limit > 0) ? limit : LIMIT;
	var id_min = (page - 1) * limit;
	var id_max = id_min + LIMIT;
	//查询条件
	linkman = linkman?linkman:"";
	companyname = companyname?companyname:"";
	job = job?job:"";
	place = place?place:"全部地区";
	address = address?address:"";
	var change = "";
	if(linkman != ""){
		change += " and linkman like '@"+linkman+"@'";
	}
	if(companyname != ""){
		change += " and companyname like '@"+companyname+"@'";
	}
	if(job != ""){
		change += " and job like '@"+job+"@'";
	}
	if(place != "全部地区"){
		change += " and place like '@"+place+"@'";
	}
	if(address != ""){
		change += " and address like '@"+address+"@'";
	}
	var sql1 = "select top " + limit + " * from dbo.TClinkman where id not in ( select top " + id_min + " id from dbo.TClinkman order by id desc) "+change+" order by id desc";
	var sql2 = "select count(*) as count from dbo.TClinkman where 1=1 "+change;
	console.log(sql1);
	async.waterfall([function(callback) {
		request({
			encoding: null,
			url: "http://www.jdjs.com.cn/jdtcms/WXContactBase.asp?p=" + sql1
		}, function(error, res, body) {
			if (!error && res.statusCode == 200) {
				var body_zh = (Iconv.decode(body, 'utf-8').toString());
				//console.log(body_zh);
				callback(null, (body_zh));
			}
		});
	}, function(result, callback) {
		request("http://www.jdjs.com.cn/jdtcms/getCount.asp?p=" + sql2, function(error, response, body) {
			if (!error && response.statusCode == 200) {
				//输出返回的内容
				//console.log(body);
				callback(null, result, body);
			}
		});
	}], function(err, rows, result) {
		if (err) {
			console.log(err);
		} else {
			rows = rows.replace(/"/g, "“");
			var str = '[';
			var arr1 = rows.split("*");
			for (var i = 0; i < arr1.length; i++) {
				var arr2 = arr1[i].split("@");
				if (i == 0) {
					str += '{"linkman":"' + arr2[0] + '","companyname":"' + arr2[1] + '","job":"' + arr2[2] + '","id":"' + arr2[3] + '","cid":"' + arr2[4] + '"}';
				} else {
					str += ',{"linkman":"' + arr2[0] + '","companyname":"' + arr2[1] + '","job":"' + arr2[2] + '","id":"' + arr2[3] + '","cid":"' + arr2[4] + '"}';
				}
			}
			str += ']';

			var total = result;

			var totalpage = Math.ceil(total / limit);
			var isFirstPage = page == 1;
			var isLastPage = ((page - 1) * limit + result.length) == total;

			res.render("WXContactBase",{
				record:JSON.parse(str),
				page: page,
				total: total,
				totalpage: totalpage,
				isFirstPage: isFirstPage,
				isLastPage: isLastPage,
				linkman: linkman,
				companyname: companyname,
				job: job,
				place: place,
				address: address
			});
		}
	});
	
}

function GetDateStr_end(time,AddDayCount) { 
	var dd = new Date(time); 
  dd.setDate(dd.getDate()+AddDayCount);//获取AddDayCount天后的日期 
  var y = dd.getFullYear(); 
  //var m = dd.getMonth()+1;//获取当前月份的日期 
  //var d = dd.getDate(); 
  var m = (((dd.getMonth()+1)+"").length==1)?"0"+(dd.getMonth()+1):(dd.getMonth()+1);
  var d = (((dd.getDate())+"").length==1)?"0"+(dd.getDate()):(dd.getDate());
  var hh = dd.getHours();
  var mm = dd.getMinutes();
  var ss = dd.getSeconds(); 
  console.log(y+"-"+m+"-"+d + " " + hh+":"+mm+":"+ss);
  return y+"-"+m+"-"+d +" " + hh+":"+mm+":"+ss; 
}

exports.WXpromatbase = function(req, res) {
	var matname = req.query.matname;
	var proname = req.query.proname;
	var start_time = req.query.start_time;
	var end_time = req.query.end_time;
	var page = parseInt(req.param("p"));
	var LIMIT = 20;
	page = (page && page > 0) ? page : 1;
	var limit = (limit && limit > 0) ? limit : LIMIT;
	var id_min = (page - 1) * limit;
	var id_max = id_min + LIMIT;
	//查询条件
	matname = matname?matname:"";
	proname = proname?proname:"";
	start_time = start_time?start_time:"";
	end_time = end_time?end_time:"";
	var change = "";
	if(matname != ""){
		change += " and matname like '@"+matname+"@'";
	}
	if(proname != ""){
		change += " and proname like '@"+proname+"@'";
	}
	if(start_time != ""){
		change += " and ptime >= '"+start_time+"'";
	}
	if(end_time != ""){
		change += " and ptime <= '"+GetDateStr_end(end_time,1)+"'";
	}
		
	var sql1 = "select top " + limit + " * from dbo.pro_mat_view where id not in ( select top " + id_min + " id from dbo.pro_mat_view order by id desc) "+change+" order by id desc";
	var sql2 = "select count(*) as count from dbo.pro_mat_view where 1=1 "+change;
	console.log(sql1);
	async.waterfall([function(callback) {
		request({
			encoding: null,
			url: "http://www.jdjs.com.cn/jdtcms/WXpromatbase.asp?p=" + sql1
		}, function(error, res, body) {
			if (!error && res.statusCode == 200) {
				var body_zh = (Iconv.decode(body, 'utf-8').toString());
				//console.log(body_zh);
				callback(null, (body_zh));
			}
		});
	}, function(result, callback) {
		request("http://www.jdjs.com.cn/jdtcms/getCount.asp?p=" + sql2, function(error, response, body) {
			if (!error && response.statusCode == 200) {
				//输出返回的内容
				//console.log(body);
				callback(null, result, body);
			}
		});
	}], function(err, rows, result) {
		if (err) {
			console.log(err);
		} else {
			rows = rows.replace(/"/g, "“");
			var str = '[';
			var arr1 = rows.split("*");
			for (var i = 0; i < arr1.length; i++) {
				var arr2 = arr1[i].split("@");
				if (i == 0) {
					str += '{"matname":"' + arr2[0] + '","proname":"' + arr2[1] + '","ptime":"' + arr2[2] + '","proid":"' + arr2[3] + '","id":"' + arr2[4] + '"}';
				} else {
					str += ',{"matname":"' + arr2[0] + '","proname":"' + arr2[1] + '","ptime":"' + arr2[2] + '","proid":"' + arr2[3] + '","id":"' + arr2[4] + '"}';
				}
			}
			str += ']';

			var total = result;

			var totalpage = Math.ceil(total / limit);
			var isFirstPage = page == 1;
			var isLastPage = ((page - 1) * limit + result.length) == total;

			res.render("WXpromatbase",{
				record:JSON.parse(str),
				page: page,
				total: total,
				totalpage: totalpage,
				isFirstPage: isFirstPage,
				isLastPage: isLastPage,
				matname: matname,
				proname: proname,
				start_time:start_time,
				end_time:end_time
			});
		}
	});
	
}

exports.reg = function(req, res) {
	var code = req.query.code;
	var appId = settings.AppID;
	var appSecret = settings.AppSecret;
	var url = "https://api.weixin.qq.com/sns/oauth2/access_token?grant_type=authorization_code&appid=" + appId + "&secret=" + appSecret + "&code=" + code;
	request(url, function(err, response, body) {
		if (!err && response.statusCode == 200) {
			if (JSON.parse(body).errcode != null) {
				console.log(body);
				res.redirect(req.url);
				return false;
			}
			console.log(body);
			var openid = JSON.parse(body).openid;
			res.render("reg", {
				openid: openid
			});
		}
	});
}

exports.message = function(req, res) {
	var code = req.query.code;
	var appId = settings.AppID;
	var appSecret = settings.AppSecret;
	var url = "https://api.weixin.qq.com/sns/oauth2/access_token?grant_type=authorization_code&appid=" + appId + "&secret=" + appSecret + "&code=" + code;
	request(url, function(err, response, body) {
		if (!err && response.statusCode == 200) {
			if (JSON.parse(body).errcode != null) {
				console.log(body);
				res.redirect(req.url);
				return false;
			}
			console.log(body);
			var openid = JSON.parse(body).openid;
			res.render("message", {
				openid: openid
			});
		}
	});
}

exports.modelreg = function(req, res) {
	var code = req.query.code;
	var appId = settings.AppID;
	var appSecret = settings.AppSecret;
	var url = "https://api.weixin.qq.com/sns/oauth2/access_token?grant_type=authorization_code&appid=" + appId + "&secret=" + appSecret + "&code=" + code;
	request(url, function(err, response, body) {
		if (!err && response.statusCode == 200) {
			if (JSON.parse(body).errcode != null) {
				console.log(body);
				res.redirect(req.url);
				return false;
			}
			console.log(body);
			var openid = JSON.parse(body).openid;
			res.render("modelreg", {
				openid: openid
			});
		}
	});
}

exports.Query_redirect = function(req, res) {
	var code = req.query.code;
	var appId = settings.AppID;
	var appSecret = settings.AppSecret;
	var page = req.query.page;
	var url = "https://api.weixin.qq.com/sns/oauth2/access_token?grant_type=authorization_code&appid=" + appId + "&secret=" + appSecret + "&code=" + code;
	request(url, function(err, response, body) {
		if (!err && response.statusCode == 200) {
			if (JSON.parse(body).errcode != null) {
				console.log(body);
				res.redirect(req.url);
				return false;
			}
			console.log(body);
			var openid = JSON.parse(body).openid;
			//判断建定通账户是否可用
			var sql1 = "select name from admin where state_id = 1 and username = '"+openid+"' and limited > now()";
			mysql.query(sql1, function(err, rows1) {
				if (err) return console.error(err.stack);
				var isNew = rows1[0]?"1":"0";
				var label = rows1[0]?rows1[0].name:"";
				res.render("Query_redirect", {
					label: label,
					page: page,
					isNew:isNew
				});
			});
		}
	});
}

exports.myinfo = function(req, res) {
	var code = req.query.code;
	var appId = settings.AppID;
	var appSecret = settings.AppSecret;
	var url = "https://api.weixin.qq.com/sns/oauth2/access_token?grant_type=authorization_code&appid=" + appId + "&secret=" + appSecret + "&code=" + code;
	request(url, function(err, response, body) {
		if (!err && response.statusCode == 200) {
			if (JSON.parse(body).errcode != null) {
				console.log(body);
				res.redirect(req.url);
				return false;
			}
			console.log(body);
			var openid = JSON.parse(body).openid;
			/*根据openid得到未兑换的积分*/
			var sql1 = "select score_unused from wx_user where openid = '" + openid + "'";
			mysql.query(sql1, function(err, rows1) {
				if (err) return console.error(err.stack);
				/*根据openid得到账号有效期*/
				var sql2 = "select limited from admin where username = '" + openid + "'";
				mysql.query(sql2, function(err, rows2) {
					if (err) return console.error(err.stack);
					var d = "未激活";
					if (rows2[0]) {
						d = rows2[0].limited;
						d = d ? d.Format("yyyy-MM-dd hh:mm:ss") : "未激活";
					}
					/*得到所有的红包的分类*/
					var sql3 = "select * from redpacket where state_id = 1 order by sort_id desc";
					mysql.query(sql3, function(err, rows3) {
						if (err) return console.error(err.stack);
						var sql4 = "select * from settings";
						mysql.query(sql4, function(err, rows4) {
							if (err) return console.error(err.stack);
							res.render("myinfo", {
								openid: openid,
								score_unused: rows1[0].score_unused,
								limited: d,
								redpacket: rows3,
								settings: rows4
							});
						});
					});
				});
			});
		}
	});
	//res.render("myinfo");
}

exports.weixin_js = function(req, res) {
	var id = req.query.id;
	var openid = req.query.openid;
	var timestamp = parseInt(new Date().getTime() / 1000) + '';
	var nonceStr = Math.random().toString(36).substr(2, 15);
	var appId = settings.AppID;
	var appSecret = settings.AppSecret;
	var wx_url = settings.hosts + req.url;
	console.log("wx_url:" + wx_url);
	//判断access_token和jsapi_ticket是否已经获得，并且时效在2小时(7200s)以内
	var end_time = new Date();
	var timediff = end_time.getTime() - strat_time.getTime() //时间差的毫秒数
		//console.log(end_time + "-->" + strat_time);
	timediff = timediff / 1000;
	//if(access_token == "" || jsapi_ticket == "" || Number(timediff) > 7200){
	if (1 == 1) {
		console.log("first access_token");
		//1.获取access_token
		var url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + appId + "&secret=" + appSecret;
		request(url, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				console.log("body:" + body);
				var o = JSON.parse(body);
				access_token = o.access_token;
				console.log("access_token:" + access_token);
				//2.获取jsapi_ticket
				var url_jsapi = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + access_token + '&type=jsapi';
				request(url_jsapi, function(err_jsapi, response_jsapi, body_jsapi) {
					if (!err_jsapi && response_jsapi.statusCode == 200) {
						console.log("body_jsapi:" + body_jsapi);
						jsapi_ticket = (JSON.parse(body_jsapi)).ticket;
						console.log("jsapi_ticket:" + jsapi_ticket);
						strat_time = new Date();
						var signature = signjsapi(jsapi_ticket, nonceStr, timestamp, wx_url);
						//var url_info = 'https://api.weixin.qq.com/cgi-bin/user/info?access_token='+access_token+'&openid=oEDF2xBoerpEFGh3brZPkWfVRZZg&lang=zh_CN';
						var url_info = 'https://api.weixin.qq.com/cgi-bin/user/get?access_token=' + access_token + '&next_openid=';
						request(url_info, function(err_info, response_info, body_info) {
							if (!err_info && response_info.statusCode == 200) {
								console.log(signature);
								var sql3 = "select * from post where id = " + id;
								mysql.query(sql3, function(err, rows3) {
									if (err) return console.error(err.stack);
									res.render('weixin_js', {
										signature: signature,
										jsapi_ticket: jsapi_ticket,
										body_info: body_info,
										appId: appId,
										id: id,
										openid: openid,
										img:settings.hosts + "/upload/"+rows3[0].shareimg,
										title:rows3[0].sharetitle
									});
								});
							}
						});
					}
				});
			}
		});
	} else {
		console.log("not first access_token");
		var signature = signjsapi(jsapi_ticket, nonceStr, timestamp, wx_url);
		//var url_info = 'https://api.weixin.qq.com/cgi-bin/user/info?access_token='+access_token+'&openid=oEDF2xBoerpEFGh3brZPkWfVRZZg&lang=zh_CN';
		var url_info = 'https://api.weixin.qq.com/cgi-bin/user/get?access_token=' + access_token + '&next_openid=';
		request(url_info, function(err_info, response_info, body_info) {
			if (!err_info && response_info.statusCode == 200) {
				res.render('weixin_js', {
					signature: signature,
					jsapi_ticket: jsapi_ticket,
					body_info: body_info
				});
			}
		});
	}
}

function signjsapi(jsapi_ticket, nonceStr, timestamp, url) {
	var ret = {
		jsapi_ticket: jsapi_ticket,
		nonceStr: nonceStr,
		timestamp: timestamp,
		url: url
	};
	var string = raw(ret);
	jsSHA = require('jssha');
	shaObj = new jsSHA(string, 'TEXT');
	ret.signature = shaObj.getHash('SHA-1', 'HEX');

	console.log("jsapi_ticket=>" + jsapi_ticket);
	console.log("nonceStr=>" + nonceStr);
	console.log("timestamp=>" + timestamp);
	console.log("url=>" + url);
	console.log("ret=>" + ret.signature);
	return ret;
};

function raw(args) {
	var keys = Object.keys(args);
	keys = keys.sort()
	var newArgs = {};
	keys.forEach(function(key) {
		newArgs[key.toLowerCase()] = args[key];
	});

	var string = '';
	for (var k in newArgs) {
		string += '&' + k + '=' + newArgs[k];
	}
	string = string.substr(1);
	return string;
};

/*记录用户行为*/
function setLog(sql) {
	mysql.query(sql, function(err, info) {
		if (err) return console.error(err.stack);
		// do something
	});
}

function getToday() {
	var myDate = new Date();
	var y = myDate.getFullYear();
	var m = (((myDate.getMonth() + 1) + "").length == 1) ? "0" + (myDate.getMonth() + 1) : (myDate.getMonth() + 1);
	var d = (((myDate.getDate()) + "").length == 1) ? "0" + (myDate.getDate()) : (myDate.getDate());
	return y + "-" + m + "-" + d;
}

exports.uploadImg = function(req, res) {
	var fname = req.files.imgFile.path.replace("public\\upload\\", "").replace("public/upload/", "");
	var info = {
		"error": 0,
		"url": "/upload/" + fname
	};
	res.send(info);
}

exports.sendredpack = function(req, res) {
	/*发送微信红包接口测试*/
	var pingpp = require('pingpp')('sk_live_4SqPiLHKiDKGiv1SSGa9mT4G');
	pingpp.setPrivateKeyPath(__dirname + "/pem/rsa_private_key.pem");
	pingpp.redEnvelopes.create({
		order_no: '23728937938129',
		app: {
			id: "app_1qHebLGCe5COOerH"
		},
		channel: "wx_pub", //红包基于微信公众帐号，所以渠道是 wx_pub
		amount: 100, //金额在 100-20000 之间
		currency: "cny",
		subject: "Your Subject",
		body: "Your Body",
		extra: { //extra 需填入的参数请参阅[API 文档]()
			nick_name: "建定通",
			send_name: "活动"
		},
		recipient: "oh822jvVXPrv6lILL5sZBkF8tLyM", //指定用户的 open_id
		description: "Your Description"
	}, function(err, redEnvelope) {
		//YOUR CODE
		console.log(err);
		console.log(redEnvelope);
	});
}

function sign(nonce_str, mch_billno, mch_id, wxappid, send_name, re_openid, total_amount, total_num, wishing, client_ip, act_name, remark) {
	var ret = {
		nonce_str: nonce_str,
		mch_billno: mch_billno,
		mch_id: mch_id,
		wxappid: wxappid,
		send_name: send_name,
		re_openid: re_openid,
		total_amount: total_amount,
		total_num: total_num,
		wishing: wishing,
		client_ip: client_ip,
		act_name: act_name,
		remark: remark
	};
	var string = raw(ret);
	string = string + '&key=1234567890abcdefghijklmnopqrstuv';
	var crypto = require('crypto');
	return crypto.createHash('md5').update(string, 'utf8').digest('hex');
};

function raw(args) {
	var keys = Object.keys(args);
	keys = keys.sort()
	var newArgs = {};
	keys.forEach(function(key) {
		newArgs[key.toLowerCase()] = args[key];
	});

	var string = '';
	for (var k in newArgs) {
		string += '&' + k + '=' + newArgs[k];
	}
	string = string.substr(1);
	return string;
};

Date.prototype.Format = function(fmt) {
	var d = this;
	var o = {
		"M+": d.getMonth() + 1, //月份
		"d+": d.getDate(), //日
		"h+": d.getHours(), //小时
		"m+": d.getMinutes(), //分
		"s+": d.getSeconds(), //秒
		"q+": Math.floor((d.getMonth() + 3) / 3), //季度
		"S": d.getMilliseconds() //毫秒
	};
	if (/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (d.getFullYear() + "").substr(4 - RegExp.$1.length));
	}
	for (var k in o) {
		if (new RegExp("(" + k + ")").test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		}
	}
	return fmt;
}