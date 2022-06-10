import sys
from github import Github
import json
if __name__ == "__main__":
    token = "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"
    g = Github(token)
    username = sys.argv[1]
    message  = username + ": " + sys.argv[2]
    script_mode = sys.argv[3]
    repo = g.get_repo("lobitzb564/gitchat")
    if script_mode == "w":
        repo.create_issue(message)
    elif script_mode == "r":
        issue_arr = list(repo.get_issues(state="open"))
        temp_arr = ["".join(i.title.split()[1:]) for i in issue_arr]
        last_two = list(map(lambda s: s.strip().casefold(), temp_arr[:2]))
        
        if (len(issue_arr)>=2) and (last_two[0] == "tilted") and (last_two[1]=="wherewedropping"):    
            for issue in issue_arr:
                issue.edit(state='closed')
            print("")
        else:
            ret_arr = []
            for issue in issue_arr:
                ret_arr.append(issue.title)
            ret_dict = {"messages":ret_arr}
            print(json.dumps(ret_dict))

