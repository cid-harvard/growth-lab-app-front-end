import json
import csv
import os
import re

def convert_technology_space():
    # Read the JSON file
    json_file_path = "public/static/technology_space.json"
    print(f"Reading {json_file_path}...")
    
    with open(json_file_path, 'r') as file:
        data = json.load(file)
    
    # The data is an array of plotly trace objects
    print(f"Found {len(data)} data objects in the file")
    
    # Process links (lines trace)
    # The first element typically contains the lines that connect nodes
    lines_data = data[0]  # This is the trace containing lines
    
    # Process nodes (scatter points traces)
    # The other elements contain scatter points with metadata
    nodes_data = []
    
    # Node ID counter (to create unique IDs)
    node_id_map = {}  # Maps (x,y) coordinates to node IDs
    
    # Find traces with nodes (scatter points with text)
    for trace_idx, trace in enumerate(data[1:], 1):  # Skip the first element which has the lines
        if trace.get("mode") == "markers" and "x" in trace and "y" in trace:
            # This trace has scatter points (nodes)
            for i in range(len(trace["x"])):
                # Extract technology code from customdata if available
                tech_code = None
                if "customdata" in trace and i < len(trace["customdata"]):
                    tech_code = trace["customdata"][i]
                
                # Extract info from text if available
                category = "Unknown"
                description = ""
                
                if "text" in trace and i < len(trace["text"]):
                    text = trace["text"][i]
                    
                    # Extract category/group from text field
                    group_match = re.search(r'Group: ([^<]+)', text)
                    if group_match:
                        category = group_match.group(1).strip()
                    
                    # Extract description
                    desc_match = re.search(r'Description: ([^<]+)', text)
                    if desc_match:
                        description = desc_match.group(1).strip()
                
                # Create a node with the required fields
                x_coord = trace["x"][i]
                y_coord = trace["y"][i]
                
                # Create or get a unique ID for this node
                coord_key = f"{x_coord},{y_coord}"
                if coord_key not in node_id_map:
                    # Use technology code as ID if available, otherwise create a sequential ID
                    if tech_code:
                        node_id_map[coord_key] = tech_code
                    else:
                        node_id_map[coord_key] = f"node_{len(node_id_map) + 1}"
                
                node_id = node_id_map[coord_key]
                
                node = {
                    "id": node_id,
                    "x": x_coord,
                    "y": y_coord,
                    "category": category,
                }
                
                # Add technology code if available
                if tech_code:
                    node["technology_code"] = tech_code
                
                # Add description if available
                if description:
                    node["description"] = description
                
                # Add the full text for reference
                if "text" in trace and i < len(trace["text"]):
                    node["text"] = trace["text"][i]
                
                # Add marker size if available
                if "marker" in trace and "size" in trace["marker"] and i < len(trace["marker"]["size"]):
                    node["size"] = trace["marker"]["size"][i]
                
                nodes_data.append(node)
    
    print(f"Processed {len(nodes_data)} nodes")
    
    # Create links by pairing consecutive x,y coordinates in the lines trace
    # We need to identify nodes by their IDs
    links = []
    x_coords = lines_data["x"]
    y_coords = lines_data["y"]
    
    i = 0
    while i < len(x_coords) - 2:  # Process pairs of points
        if x_coords[i+2] is None:  # End of a line segment
            source_x, source_y = x_coords[i], y_coords[i]
            target_x, target_y = x_coords[i+1], y_coords[i+1]
            
            # Look up node IDs by coordinates
            source_key = f"{source_x},{source_y}"
            target_key = f"{target_x},{target_y}"
            
            if source_key in node_id_map and target_key in node_id_map:
                # Create a link using node IDs
                link = {
                    "source": node_id_map[source_key],
                    "target": node_id_map[target_key],
                    "value": 1  # Default weight
                }
                links.append(link)
            
            i += 3  # Skip the null value to the next segment start
        else:
            # Continue with consecutive points in the same line
            source_x, source_y = x_coords[i], y_coords[i]
            target_x, target_y = x_coords[i+1], y_coords[i+1]
            
            # Look up node IDs by coordinates
            source_key = f"{source_x},{source_y}"
            target_key = f"{target_x},{target_y}"
            
            if source_key in node_id_map and target_key in node_id_map:
                # Create a link using node IDs
                link = {
                    "source": node_id_map[source_key],
                    "target": node_id_map[target_key],
                    "value": 1  # Default weight
                }
                links.append(link)
            
            i += 1
    
    print(f"Processed {len(links)} links")
    
    # Create nodes CSV file
    nodes_csv_path = "public/static/technology_space_nodes.csv"
    print(f"Creating {nodes_csv_path}...")
    
    # Write nodes CSV with the required columns first, then other columns
    required_columns = ["id", "x", "y", "category", "size"]
    
    # Determine all possible node fields
    node_headers = set()
    for node in nodes_data:
        for key in node.keys():
            node_headers.add(key)
    
    # Arrange headers with required columns first
    final_headers = [header for header in required_columns if header in node_headers]
    for header in sorted(node_headers):
        if header not in required_columns:
            final_headers.append(header)
    
    # Write nodes CSV
    with open(nodes_csv_path, 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=final_headers, 
                              dialect='excel', 
                              quoting=csv.QUOTE_MINIMAL)
        writer.writeheader()
        
        for node in nodes_data:
            row = {}
            for key in final_headers:
                if key in node:
                    row[key] = node[key]
                else:
                    row[key] = ""
            writer.writerow(row)
    
    # Create links CSV file
    links_csv_path = "public/static/technology_space_links.csv"
    print(f"Creating {links_csv_path}...")
    
    # Write links CSV with source and target columns
    with open(links_csv_path, 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=["source", "target", "value"])
        writer.writeheader()
        
        for link in links:
            writer.writerow(link)
    
    print("Conversion completed successfully!")
    print(f"Nodes saved to: {os.path.abspath(nodes_csv_path)}")
    print(f"Links saved to: {os.path.abspath(links_csv_path)}")

if __name__ == "__main__":
    # Increase CSV field size limit to prevent truncation
    csv.field_size_limit(int(1e9))
    convert_technology_space() 