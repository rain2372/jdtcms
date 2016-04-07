var settings = require('../settings');
var mysql = require('../models/db');
var User = require('../models/user');
var Post = require('../models/post');
var WxUser = require('../models/wx_user');
var WxRecord = require('../models/wx_record');
var async = require('async');
var debug = require('debug')('myapp:index');
var ejsExcel = require("./ejsExcel");
var fs = require("fs");
var formidable = require('formidable');

exports.userdo = function(req, res) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	var user = new User(req.params.sql,req,res);
}

exports.wx_userdo = function(req, res) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	var wx_user = new WxUser(req.params.sql,req,res);
}

exports.postdo = function(req, res) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	var post = new Post(req.params.sql,req,res);
}

exports.wx_recorddo = function(req, res) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	var wx_record = new WxRecord(req.params.sql,req,res);
}

exports.getopenid = function(req, res) {
	var code = req.query.code;
	console.log(code);
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
        "url": "/upload/"+fname
    };
    res.send(info);
}

Date.prototype.Format = function(fmt) {
		var d = this;
		var o = {
			"M+": d.getMonth() + 1, //月份
			"d+": d.getDate(), //日
			"h+": d.getHours(), //小时
			"m+": d.getMinutes(), //分
			"s+": d.getSeconds(), //秒
			"q+": Math.floor((d.getMonth() + 3) / 3), //季度
			"S" : d.getMilliseconds() //毫秒
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