import json
import csv
import os

def convert_industry_space():
    # Read the JSON file
    json_file_path = "public/space-viewer/industry_space.json"
    print(f"Reading {json_file_path}...")
    
    with open(json_file_path, 'r') as file:
        data = json.load(file)
    
    # Extract nodes and links
    nodes = data["nodes"]
    links = data["links"]
    
    print(f"Found {len(nodes)} nodes and {len(links)} links")
    
    # Create nodes CSV file
    nodes_csv_path = "industry_space_nodes.csv"
    print(f"Creating {nodes_csv_path}...")
    
    # Initialize headers by collecting all possible fields from nodes
    node_headers = set()
    for node in nodes:
        for key in node.keys():
            if key != "parent":  # Handle parent separately since it's a nested object
                node_headers.add(key)
    
    # Add headers for parent fields
    parent_headers = set()
    for node in nodes:
        if "parent" in node and node["parent"]:
            for key in node["parent"].keys():
                parent_headers.add(f"parent_{key}")
    
    # Combine all headers
    all_node_headers = sorted(list(node_headers)) + sorted(list(parent_headers))
    
    # Write nodes CSV with unlimited field size to prevent line wrapping
    with open(nodes_csv_path, 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=all_node_headers, 
                               dialect='excel', 
                               quoting=csv.QUOTE_MINIMAL)
        writer.writeheader()
        
        for node in nodes:
            row = {}
            
            # Copy regular node fields
            for key in node_headers:
                if key in node:
                    row[key] = node[key]
                else:
                    row[key] = ""
            
            # Copy and flatten parent fields
            if "parent" in node and node["parent"]:
                for key in node["parent"]:
                    row[f"parent_{key}"] = node["parent"][key]
            else:
                for header in parent_headers:
                    row[header] = ""
            
            writer.writerow(row)
    
    # Create links CSV file
    links_csv_path = "industry_space_links.csv"
    print(f"Creating {links_csv_path}...")
    
    # Determine headers for links
    link_headers = set()
    for link in links:
        for key in link.keys():
            link_headers.add(key)
    
    link_headers = sorted(list(link_headers))
    
    # Write links CSV
    with open(links_csv_path, 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=link_headers)
        writer.writeheader()
        
        for link in links:
            writer.writerow(link)
    
    print("Conversion completed successfully!")
    print(f"Nodes saved to: {os.path.abspath(nodes_csv_path)}")
    print(f"Links saved to: {os.path.abspath(links_csv_path)}")

if __name__ == "__main__":
    # Increase CSV field size limit to prevent truncation
    csv.field_size_limit(int(1e9))
    convert_industry_space() 