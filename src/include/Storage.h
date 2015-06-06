#pragma once
/*#include <sqlite/connection.hpp>
#include <sqlite/result.hpp>
#include <sqlite/query.hpp>
#include <sqlite/execute.hpp>
*/

#include <mysql++/mysql++.h>
#include <mutex>
#include "Exception.h"

namespace Commutator {

    class StorageException : public Exception { };

    class Storage
    {
        private:
            std::unique_ptr<mysqlpp::Connection> db_;
	    std::mutex mutex_;
        public:
            struct Point {
                enum Status {
                    psInvactive = 0,
                    psActive
                };
                size_t point_id;
                std::string type;
                std::string id;
                std::string password;
                std::string name;
            };

            struct Route {
                size_t route_id;
                size_t source_point_id;
                std::string source_number;
                size_t destination_point_id;
                std::string destination_number;
            };

            Storage(const std::string& host, const std::string& database, const std::string& username, const std::string& password, uint16_t port = 3306)
            {
                try {
                    db_.reset(new mysqlpp::Connection());
		    db_->connect(database.c_str(), host.c_str(), username.c_str(), password.c_str(), port);
                } catch (std::exception& e) {
                    throw new Exception(3, e.what());
                }
            }

            mysqlpp::Connection& Handle()
            {
                return *db_;
            }

            size_t UpdateAllPointsStatus(size_t status)
            {
		std::lock_guard<std::mutex> lock(mutex_);
		auto query = db_->query();
		query << "UPDATE points SET status = " << (int)status;
		query.execute();
            }

            size_t UpdatePointStatus(size_t point_id, size_t status)
            {
		std::lock_guard<std::mutex> lock(mutex_);
		auto query = db_->query();
		query << "UPDATE points SET status  = " << (int)status << " WHERE point_id = " << (int)point_id;
		query.execute();
            }

            std::vector<Point> GetPoints()
            {
                std::vector<Point> points;
		auto query = db_->query("SELECT point_id, type, id, password, name  FROM points");
		if (auto res = query.store()) {
                    if (res.num_rows() > 0) {
	                for (auto& row : res) {
    		            Point p;
    	    		    p.point_id = row[0];
                	    p.type = row[1].c_str();
                	    p.id = row[2].c_str();
                	    p.password = row[3].c_str();
                	    p.name = row[4].c_str();
                	    points.push_back(p);
                	}
            	    }
		}
                return std::move(points);
            }

            std::vector<Route> GetRoutes()
            {
                std::vector<Route> routes;
                auto query = db_->query("SELECT route_id, source_point_id, source_number, destination_point_id, destination_number FROM routes");
                if (auto res = query.store()) {
		    if (res.num_rows() > 0) {
                	for (auto& row: res) {
                    	    Route r;
                    	    r.route_id = row[0];
                    	    r.source_point_id = row[1];
                    	    r.source_number = row[2].c_str();
                    	    r.destination_point_id = row[3];
                	    r.destination_number = row[4].c_str();
                    	    routes.push_back(r);
                	}
		    }
                }
                return std::move(routes);
            }

            void addEvent(size_t route_id, const std::string& source_number)
            {
		std::lock_guard<std::mutex> lock(mutex_);
                auto query = db_->query("INSERT INTO events (route_id, source_number)  VALUES(");
		query << (int)route_id << ", '" << source_number << "')";
		query.execute();
            }
    };
}