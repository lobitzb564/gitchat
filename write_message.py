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
        ret_arr = []
        for issue in issue_arr:
            ret_arr.append(issue.title)
        ret_dict = {"messages":ret_arr}
        print(json.dumps(ret_dict))
    else:
        open_issues = repo.get_issues(state='open')
        for issue in open_issues:
            issue.edit(state='closed')
